var app = require('express')
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server)
  , nano = require('nano')("http://localhost:5984")
  , db_name = "test"
  , db = nano.use(db_name)
  , activeClients = {}
  , blackListIPs = []
  , store;
  
//add ip to blacklist and disconnect the socket
function addToBlacklist(socket){
	serverLog("**IP ADDED TO BLACKLIST** | Too many login attempts", socket.id);
	//add ip, date, and reason to blacklist array in memory
	blackListIPs.push([activeClients[socket.id][1],Date(),"Too many login attempts"]);
	//write updated blacklist to disk
	    //TO DO
	//disconnect the socket.  On reconnect, they will be found in the blacklist and denied access.
	socket.disconnect();
}

//check blacklist for IP handshaking, if found deny connection
function checkBlacklist(connectingIP, callback){
	console.log("Blacklist:"+blackListIPs+" | Checking IP: " + connectingIP);
	blackListIPs.forEach(function(item) { 
		if(item[0] == connectingIP)
			callback(null,false);
		});
	//IP not found in blacklist, so pass true to allow connection;
	callback(null,true);
}

//insert documents into couchDB
function insert_doc(mydoc, tried, socketid) {
    db.insert(mydoc, mydoc.id, function (err, body, header) {
        if (err) {
            if (err.error === 'conflict' && tried < 1) {
                // get record _rev and retry
                return db.get(mydoc.id, function (err, doc) {
                    mydoc._rev = doc._rev;
                    insert_doc(mydoc, tried + 1, socketid);
                });
            }
            else{
            	// the second attempt at inserting with rev failed OR the error given was not an update conflict, expose the error
            	serverLog("**SERVER ERROR** | DB INSERT FAILURE: [db.insert] | Document = " + mydoc.id  + " || " + err, socketid);
            	return;
            }
        }
        serverLog("DB INSERT SUCCESS: Document = " + mydoc.id, socketid);
    }); 
}

//Authorize the user on initial connection by looking up their username and password in the database and then assigning a token
function userAuthorization(userObj, socket){
	db.get("AppUsers", function (err,doc) {
		var serverMessage;
		if (err){
			serverMessage = 'SERVER ERROR: [db.get] | When Getting Document AppUsers From DB || ' + err;
		}
		else{
			for (key in doc.Users) {
				if(userObj.UserName.toUpperCase()==key)
					if(userObj.UserPassword==doc.Users[key].password) {
						serverMessage = "LOGIN ACCEPTED: User = '"+key+"'";
						//add client to authorized active clients
						activeClients[socket.id][3] = userObj.UserName;
						//create and send token to client for future authorization
						var sessionToken = createToken(socket.id);
						activeClients[socket.id][5] = sessionToken;
						socket.emit('LoginApproved',sessionToken);
					}
					else {
						//Notify client password was invalid
						socket.emit('LoginDenied',"Invalid Password");
						serverMessage = "LOGIN DENIED: Invalid Password = '" + userObj.UserPassword+"'";
					}
			}	
			//if no other message was generated, then no user was found
			if (serverMessage == null) {
				//Notify client login was invalid
				socket.emit('LoginDenied',"Invalid Login");
				serverMessage = "LOGIN DENIED: Invalid User Name = '"+userObj.UserName+"'";
			}
				
		}
		serverLog(serverMessage, socket.id);
	});
};

//log messages
function serverLog(message, socketid)
{
	if (socketid !== undefined)
		console.log(message + " || More Info:  Validated User = '" + activeClients[socketid][3] + "' | IP = '" + activeClients[socketid][1]+":"+activeClients[socketid][2] + "' | Socket = '" + socketid+"'"); 
	else
		console.log(message);
}

//create token for authenticated clients
function createToken(socketid){
	var sessionToken = Math.random();
	serverLog("TOKEN CREATED: " + sessionToken, socketid);
	return sessionToken;
}

//check token for authenticated clients
function checkToken(socket, sessionToken){
	if(activeClients[socket.id][5] !== sessionToken) {
		serverLog("**INVALID TOKEN**: " + sessionToken, socket.id);
		return false;
	} else {
		return true;
	}
}

server.listen(process.env.VMC_APP_PORT || 80, null);  //for AppFog
//app.listen(8080);  //for localhost

//socket io authorization event
io.configure(function (){
	  io.set('authorization', function (handshakeData, callback) {
	  //call a function to check to see if the IP is on the blacklist and if not then set authorized to true, else false.  Pass authorized to the callback to allow or deny connection.
		  checkBlacklist(handshakeData.address.address, function(err,authorized) {
		    if (err) 
		      return callback(err);
		    else
		 	  callback(null, authorized);
		  });
	  });
	});


//assign the event handlers below to all sockets that connect
io.sockets.on('connection', function (socket) {    
	  //add new socket to the active clients object for later use
	  // [0=socket, 1=IP, 2=Port, 3=userName, 4=login attempts, 5=token]
	  activeClients[socket.id] = [socket, socket.handshake.address.address,socket.handshake.address.port, null,0,""];
	  serverLog("SOCKET CONNECTED", socket.id);
	 
	  //on disconnect event, remove socket from active clients object and log the disconnect
	  socket.on('disconnect', function  () {
	    serverLog("SOCKET DISCONNECTED", socket.id);
		delete activeClients[socket.id];
	    console.log(activeClients);
	  });
	  
	  //on authorize event, receive the user object and check its validity.  If invalid, close the connection
	  //and log the IP.  If valid, assign user name to the active socket id in activeClients object.  If new user,
	  //create the entry in the database
	  socket.on('UserAuthorize', function  (userObj) {
		    //add 1 to login attempts for that socket
		    activeClients[socket.id][4] += 1;
			//disconnect socket and add to blacklist if too many login attempts, otherwise call the userAuthorization function
		    if (activeClients[socket.id][4] > 40)
		    	addToBlacklist(socket);
		    else
		    	var userCheck = userAuthorization(userObj, socket);
		  });
	  
	  //on sync_goal_server event, receive the goal update and write it to the DB, then send the goal update to all clients using same username
	  socket.on('SyncGoalServer', function  (sessionToken,JSONgoal) {
		var key;
		//check token validity
		if(checkToken(socket,sessionToken) == false) {
			socket.disconnect();
			//TODO:  Add a logging function to log IPs using wrong token, and add to black list if IP connects too many times with bad token
		}
		else
			//write JSONgoal to couchdb
			insert_doc(JSONgoal,0,socket.id);
			//send update to other clients belonging to same user
		    for (key in activeClients) {
		    	//console.log('iterating through activeClients...current key:'+key+', value1: '+activeClients[key][1]);
		    	if(activeClients[key][3] === JSONgoal.UserName){
		    		activeClients[key][0].emit('SyncGoalClient', JSONgoal);
		    		console.log('emitting '+JSONgoal.id+'to user ' + activeClients[key][1]);
		    	}
		    }
	  });

	 // io.sockets.emit('entrance', {message: 'A new chatter is online.'});
	});