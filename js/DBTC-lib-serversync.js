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
	$.CurrentUser.UserName=document.forms["frmLogin"]["userName"].value;
	$.CurrentUser.UserPassword=document.forms["frmLogin"]["userPassword"].value;
	
	//Goal1.id = userObj.userName+'_Goal1';	//Send User Name
	socket.emit('UserAuthorize', $.CurrentUser);
}

//Store token from server and launch calendar
socket.on('LoginApproved', function  (sessionToken) {
    storeToken(sessionToken);
    launchCalendar();
});

//Warn user if login is not approved
socket.on('LoginDenied', function  (message) {
	alert("Login Failed: "+message);
});

//Store token in memory for retrieval when communicating back to server after login
function storeToken(sessionToken){
	$.CurrentUser.SessionToken = sessionToken;
}
//Get token for comm with server
function getToken()
{
	return $.CurrentUser.SessionToken;
}

//---------------------------
//Registration related logic
//---------------------------

//Send reg info to server
function registration_to_server(){
    console.log("Registering new account on server...");
    $.CurrentUser.UserName=document.forms["frmRegistration"]["regUserName"].value;
    $.CurrentUser.UserPassword=document.forms["frmRegistration"]["regUserPassword1"].value;
    $.CurrentUser.UserRealName=document.forms["frmRegistration"]["regRealName"].value;

    socket.emit('UserRegistration', $.CurrentUser);
};

//Handle successful registration: alert user, clear reg. form, store token from server, and launch calendar
socket.on('RegistrationSuccessful', function  (sessionToken) {
    storeToken(sessionToken);
    registrationSuccessMessage();
    clearRegistrationForm();
    defaultLoginToRememberMe();
    launchCalendar();
});

//Handle failed registration
socket.on('RegistrationFailed', function  (message) {
    registrationFailureMessage(message);
});

//Notify user that registration was successful
function registrationSuccessMessage(){
    alert("Registration Successful!  Your login is: "+ $.CurrentUser.UserName.toUpperCase());
}
//Notify user that registration failed. Highlight the offending field.
function registrationFailureMessage(message){
    //alert("Registration Failed: "+message);
    $("#registration-info").text(message);
    $("#regUserName").focus();
}
//clear registration form fields
function clearRegistrationForm(){
    document.forms["frmRegistration"]["regUserName"].value = "";
    document.forms["frmRegistration"]["regUserPassword1"].value = "";
    document.forms["frmRegistration"]["regUserPassword2"].value = "";
    document.forms["frmRegistration"]["regRealName"].value = "";
    $("#registration-info").text("");
}

//default the app to remember the user on login
function defaultLoginToRememberMe(){
    $.CurrentUser.RememberMe == true
    document.forms["frmLogin"]["userName"].value = $.CurrentUser.UserName;
    document.forms["frmLogin"]["userPassword"].value = $.CurrentUser.UserPassword;
    $('#rememberMe').prop("checked", true);
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