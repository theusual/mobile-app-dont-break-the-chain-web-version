var app = require('express'),
	server = require('http').createServer(app),
    io = require('socket.io');

server.listen(process.env.VMC_APP_PORT || 8080, null);  //for AppFog
//server.listen(8080);  //for localhost
var server_sync = io.listen(server);

//Uncomment the lines below if using connect (webserver)
//var app = connect().use(connect.static('public')).listen(serverPort);
//var server_sync = io.listen(app);
    


server_sync.sockets.on('connection', function (socket) {
  console.log('User: ' + socket.id + ' connected'); 

  socket.on('disconnect', function  () {
    console.log('User: ' + socket.id + ' disconnected');
  });

  socket.on('goal_update_server', function  (data) {
    server_sync.sockets.emit('goal_update_client', {goal: data.goal});
  });

 // server_sync.sockets.emit('entrance', {message: 'A new chatter is online.'});
});