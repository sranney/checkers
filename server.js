//express stuff
var express = require("express");
var app = express();
var bodyParser = require("body-parser");

//database stuff
var mongoose = require("mongoose");

//nodemailer
var nodemailer = require("nodemailer");
// using SendGrid's v3 Node.js Library
// https://github.com/sendgrid/sendgrid-nodejs
// const sendgridkey = require("../../../secrets/sendGridKey")
// const sgMail = require('@sendgrid/mail');
// sgMail.setApiKey(sendgridkey);

//mongoose models
var userModel = require("./models/users.js");
var potluckModel = require("./models/potluck.js");
var chatModel = require("./models/chat.js");

//body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//port
var port = process.env.PORT || 5000;

//creating server - necessary to use socket io with
var server = require("http").createServer(app);

//including socket io
const socketIO = require("socket.io");
const io = socketIO(server);//setting up socket io on the above created server

//listening on port 5000
server.listen(port);

//setting up mongodb connection
mongoose.Promise = Promise;
var connection = process.env.MONGODB_URI||"mongodb://localhost/checkers";
mongoose.connect(connection, {
  useMongoClient: true
});

//route - posting new users - from log in page
app.post("/login",function(req,res){
	const UserData = {
		uid: req.body.uid,
		email: req.body.email,
		displayName: req.body.displayName,
		username: req.body.email.substr(0,req.body.email.indexOf("@")),
		photoURL: req.body.photoURL
	}
	const email = UserData.email;
	userModel.find({ "email":  email }).then(data => {
		data.length===0?
			userModel.create(UserData).then(res => {})
		:
			null;
	});
})

app.post("/sendInvite",function(req,res){
	const msgSubj = `${req.body.fromName} has invited you to play checkers`;
	const msgBody = `${req.body.msgBody}. Click this link to register and play with them: ${req.body.gameLink}`;
	
	const msg = {
	to: req.body.toEmail,
	from: 'react.checkers.game@example.com',
	subject: msgSubj,
	text: 'play checkers on checkers game',
	html: msgBody,
	};
	sgMail.send(msg).catch(err=>console.log(err));
})

//getting list items for home page
app.get("/home",function(req,res){
	potluckModel.find({}).then(data=>{
		res.json(data);
	})
})

//posting new list items for home page
app.post("/home",function(req,res){
	const potluckObj = req.body;
	potluckModel.create(potluckObj).then(data=>{
		res.json(data);
	})
})

//deleting items from list
app.get("/deleteitem/:id",function(req,res){
	potluckModel.findByIdAndRemove(req.params.id,function(res){

	});
})

//getting chats for specific chat room
app.get("/chat_:roomNum",function(req,res){
	const roomNum = req.params.roomNum;
	console.log(roomNum);
	chatModel.find({room:roomNum}).then(data=>{
		console.log(data);
		res.json(data);
	})
})

//socket io functions - function called and set up with the on connection event - socket is the individual client's socket
const SocketManager = (socket) => {

	let sendMessageToChatFromUser;
	let sendTypingFromUser;

	//event listener for when either home or chat pages are loaded successfully - this can only occur when the user is signed in
	socket.on("user connected",(user)=>{
		console.log("received");
		const email = user.email;
		//updating user's document in mongodb to reflect that the user is online
		loginUser( email ).then( res => {
			//getting list of online users from mongodb
			onlineUsers( ).then( res2 => {
				//emitting back to client the list of online users
				io.emit( "user connected" , res2 );
			
			})

		})

	})

	//listening for when a chat has been sent from the client to the server
	socket.on("chat",(msgObj)=>{
		//sending the data that has been sent from the client to mongodb
		chatModel.create(msgObj).then(data=>{
			//part of the object sent from the client is the room that the chat is for
			//send back using this information to the correct room using this room id
			socket.emit("chat_"+msgObj.room,data);//send back the data that has been added to mongodb
		})
	})

	//when a user clicks the logout button, an emit is sent from client to server
	socket.on("logout",user => {
		console.log(user);
		const email = user.email;
		//updates the user's mongodb document to reflect that the user is now offline
		logoutUser(email).then(res=>{
			//gets current list of online users from mongodb and sends to client
			onlineUsers().then(res2=>{
		
				io.emit("user connected",res2);
		
			})
		
		})

	})

}


//mongodb get online users function
function onlineUsers(){
	return userModel.find({"online":true})
}

//mongodb update user to online status function
function loginUser (email){
	return userModel.update({"email":email},{ $set: { "online": true } })
}

//mongodb update user to offline status function
function logoutUser (email){
	return userModel.update({"email":email},{ $set: { "online": false } })
}

//sets up the SocketManager function for the socket that has been picked up
io.on("connection",SocketManager);



