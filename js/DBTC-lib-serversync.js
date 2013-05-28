// @author Bryan Gregory

//Functions for communicating back and forth with server using websockets

//--------------------------
//Basic websocket event handlers
//--------------------------

var socket = io.connect('http://localhost:3333');
//Log connection status on app start up
socket.on('error', function (reason){
    alert('Warning: Unable to connect Socket.IO.  Details:', reason);
    //TODO: Make this a pretty dialog box
});
socket.on('connect', function (){
    console.info('Successfully established a working and authorized connection');
});

//-------------------
//Login related logic
//-------------------

//Send login info to server
function login_to_server(){
	$.CurrentUserSettings.UserObj.UserName=document.forms["frmLogin"]["userName"].value;
	$.CurrentUserSettings.UserObj.UserPassword=document.forms["frmLogin"]["userPassword"].value;
	
	//Goal1.id = userObj.userName+'_Goal1';	//Send User Name
	socket.emit('UserAuthorize', $.CurrentUserSettings.UserObj);
};
//Receive token from server and load calendar if login is approved
socket.on('LoginApproved', function  (sessionToken) {
	alert("Welcome "+ $.CurrentUserSettings.UserObj.UserName);
	//handle "Remember Me" checkbox
	if ($('#rememberMe').is(':checked') === true)
		rememberMe();
	else {
		document.forms["frmLogin"]["userName"].value = "";
		document.forms["frmLogin"]["userPassword"].value = "";
		$.CurrentUserSettings.UserObj.RememberMe=false;
		$.localStorage.setObject("CurrentUserSettings",$.CurrentUserSettings);
	}
	storeToken(sessionToken);
	transitionToCalendar();
});

//Handle "Remember Me"
function rememberMe(){
	//set RememberMe to true and write to local memory for retrieval on next login
	$.CurrentUserSettings.UserObj.RememberMe=true;
	$.localStorage.setObject("CurrentUserSettings",$.CurrentUserSettings);
}

//Warn user if login is not approved
socket.on('LoginDenied', function  (message) {
	alert("Login Failed: "+message);
});

//Store token in memory for retrieval when communicating back to server after login
function storeToken(sessionToken){
	$.CurrentUserSettings.UserObj.SessionToken = sessionToken;
}
//Get token for comm with server
function getToken()
{
	return $.CurrentUserSettings.UserObj.SessionToken;
}

//------------------------------------
//Goal and user settings related logic
//------------------------------------

//send goal updates to server
function sync_goal_server (JSONgoal) {
	socket.emit('SyncGoalServer', getToken(),JSONgoal);
	alert('JSON goal update sent to server' + JSONgoal.id);				
};
//process goal updates from server
function sync_goal_client (JSONgoal) {
	alert('Goal update received for Goal: ' + JSONgoal.id)
	var li = $('<li />').text(JSONgoal.id);
	$('#goalLog').append(li);
};
//Receive goal updates from server
socket.on('SyncGoalClient', function  (JSONgoal) {
	sync_goal_client(JSONgoal);
});
function sync_user_connect (userNameObj) {
	var liUser = $('<li id="'+userNameObj.userName+'">').text(userNameObj.userName);
	$('#user').append(liUser);
};
function sync_user_disconnect (userNameObj) {
	var liUser = $('<li />').text(userNameObj.userName);
	$('#'+userNameObj.userName).empty();
};
//Receive user events
socket.on('user_connect', function  (userNameObj) {
	sync_user_connect(userNameObj);
});
socket.on('user_disconnect', function  (userNameObj) {
	sync_user_disconnect(userNameObj);
});