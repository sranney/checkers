//express stuff
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var path = require("path");

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
var chatModel = require("./models/chat.js");
var gameRoomModel = require("./models/gameRoom.js");

//body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//port
var port = process.env.port || process.env.PORT || 5000;

//creating server - necessary to use socket io with
var server = require("http").createServer(app);

//including socket io
const socketIO = require("socket.io");
const io = socketIO(server);//setting up socket io on the above created server

//listening on port 5000
server.listen(port);

//wildcard for set-up=================== CAN BE REMOVED ONLY TEST++++++++++
app.use(express.static('checkers/build'));
// app.use(express.static('build'));

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
			userModel.create(UserData).then(res => {
				const room = UserData.username;
				gameRoomModel.create({room}).then(res => {})
			})
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

//getting chats for specific chat room
app.get("/chat_:roomNum",function(req,res){
	const roomNum = req.params.roomNum;
	console.log(roomNum);
	chatModel.find({room:roomNum}).then(data=>{
		console.log(data);
		res.json(data);
	})
})

app.post("/checkVacancy",function(req,res){
	const room = req.body.room;
	const username = req.body.username;
	console.log("room: "+room);
	console.log("username: "+username);
	gameRoomModel.find({room:room}).then(data=>{
		console.log(data);
		if(data.length===0){
			console.log("no room");
			res.send("room does not exist")
		}
		else if(data[0].opponent.length === 0){
			console.log("open vacancy");
			gameRoomModel.update({"room":room},{ $set: { "opponent": username } }).then(data2=>{
				res.send("you have been added to this room as an opponent")
			})
		}
		else if(data[0].opponent !== username){
			console.log("no vacancy");
			res.send("no vacancy");
		}
		else if(data[0].opponent === username){
			console.log("current opponent");
			res.send("welcome back")
		}
	})
})

app.post("/chats-home",(req,res)=>{
	const {currUsername,otherUsername} = req.body;
	chatModel.find({room:`${currUsername}-home`}).then(data=>{
		const msgArr = data.filter(msg =>{
			return msg.sender === otherUsername || msg.otherUser === otherUsername
		})
		res.json(msgArr);
	});
})

app.post("/chats-game",(req,res)=>{
	let {location,currUsername,otherUsername} = req.body;
	location = location.replace("/GamePage/","");
	console.log("Location: "+location);
	const visitor = location === currUsername ? otherUsername : currUsername;
	chatModel.find({room:`${location}-game`}).then(data=>{

		const msgArr = data.filter(msg =>{
			return msg.sender === visitor || msg.otherUser === visitor
		})
		res.json(msgArr);
	});
})

app.get('*', (req, res) => {
	console.log(req);
	res.sendFile(path.join(__dirname, '/index.html'))
});

if(process.env.NODE_ENV==='production'){
	
}

let onlineUsersArr = [];
let trueDisconnect = true;

//socket io functions - function called and set up with the on connection event - socket is the individual client's socket
const SocketManager = (socket) => {

	//event listener for when either home or chat pages are loaded successfully - this can only occur when the user is signed in
	socket.on("user connected",(user)=>{
		const email = user.email;//get email for current user (the one that set this function off)

		const username=email.substr(0,email.indexOf("@"))//compute username
		const userObjForOnlineUsers = {socket,email,username};//collect data to be used with this socket and that will be put in the array
		onlineUsers_currUser = onlineUsersArr.filter(user=>{//
			return user.email === email;
		})
		console.log("***************************************")
		console.log(onlineUsers_currUser);
		console.log("***************************************")
		if(onlineUsers_currUser.length === 0 ){ 
			onlineUsersArr.push(userObjForOnlineUsers)
		} else {
			onlineUsersArr = onlineUsersArr.map(user=>{
				if(user.email === email){
					user.socket = socket;
				}
				return user;
			})
			trueDisconnect = false;
		}

		const onlineUsers_userdata = onlineUsersArr.map(user=>{
			return {username:user.username,email:user.email};
		})
		io.emit( "user connected" , onlineUsers_userdata );	
		//updating user's document in mongodb to reflect that the user is online
		// loginUser( email,socket ).then( res => {
		// 	//getting list of online users from mongodb
		// 	onlineUsers( ).then( res2 => {
		// 		//emitting back to client the list of online users
		// 		io.emit( "user connected" , res2 );
			
		// 	})

		// })
	})

	socket.on("disconnect", () => {
		console.log(`disconnected socket: ${socket.id}`);
		onlineUsersArr = onlineUsersArr.filter(user=>{
			return user.socket !==socket;
		})
		const onlineUsers_userdata = onlineUsersArr.map(user=>{
			return {username:user.username,email:user.email};
		})
		io.emit( "user connected" , onlineUsers_userdata );	
		// const email = user.email;
		// //updates the user's mongodb document to reflect that the user is now offline
		
		// logoutUser(email).then(res=>{
		// 	//gets current list of online users from mongodb and sends to client
		// 	onlineUsers().then(res2=>{
		
		// 		io.emit("user connected",res2);
		
		// 	})
		
		// })

	})

	//when a user clicks the logout button, an emit is sent from client to server
	socket.on("logout",user => {
		const email = user.email;
		onlineUsersArr = onlineUsersArr.filter(user=>{
			return user.email !==email;
		})
		const onlineUsers_userdata = onlineUsersArr.map(user=>{
			const {username,email} = user;
			return {username,email};
		})
		io.emit( "user connected" , onlineUsers_userdata );	
		//updates the user's mongodb document to reflect that the user is now offline
		// logoutUser(email).then(res=>{
		// 	//gets current list of online users from mongodb and sends to client
		// 	onlineUsers().then(res2=>{
		
		// 		io.emit("user connected",res2);
		
		// 	})
		
		// })

	})


	//listening for when a chat has been sent from the client to the server
	socket.on("chat-home",(msgObj)=>{
		const {sender,message,to} = msgObj;
		const firstDataObj = {
			sender,
			room:`${sender}-home`,
			otherUser:to,
			message
		}
		const secondDataObj = {
			sender,
			room:`${to}-home`,
			otherUser:sender,
			message
		}
		//sending the data that has been sent from the client to mongodb
		chatModel.create(firstDataObj).then(data=>{
			chatModel.create(secondDataObj).then(data2=>{
				io.emit(`chat_${sender}_${to}`,msgObj);
				io.emit(`chat_${to}_${sender}`,msgObj);					
			})
		})
	})

	socket.on("chat-game",(msgObj)=>{
		console.log("socket - chat-game - received");
		const {location,sender,to,message} = msgObj;
		console.log(location);
		const dataObj = {
			sender,
			room:`${sender}-game`,
			otherUser:to,
			message
		}
		//sending the data that has been sent from the client to mongodb
		chatModel.create(dataObj).then(data=>{
			console.log(`chat_${location}`);
			io.emit(`chat_game_${location}`,msgObj);				
		})
	})

	socket.on("typing-home",typingObj=>{
		console.log("typing sent to server");
		const {currUsername,otherUsername,isTyping} = typingObj;
		const socketListenerID = `${otherUsername}_${currUsername}`;		
		const typingRes = isTyping ? currUsername : false;//false or the message created will say currUsername is typing
		console.log(socketListenerID);
		io.emit(`typing_home_${socketListenerID}`,typingRes);
	})

	//for sending back information regarding whose playing a game
	socket.on("game connect",playerObj=>{//whenever a player connects to a particular game page, message emitted from client
		const {room,username} = playerObj;
		gameRoomModel.find({room}).then(data=>{//look up gameroom based on room, data is the returned room data
			let gamePlayers = "";//this will be populated with the data that is returned to client
			if(data[0].opponent===""){//does the room have an opponent yet?
				if(room!==username){//if not, is the username of the client that sent this socket event to the server equal to the room name
					gamePlayers = [room,username];//if it is, then this will be the opponent
				}
				else {
					gamePlayers = [room,"no opponent yet"];//if it is the same as the room, then there is no opponent yet
				}
			}
			else {//if there is already an opponent than return the room with the opponent's name
				gamePlayers = [room,data[0].opponent];
			}
			io.emit(`game_connect_${room}`,gamePlayers);//emit the formed gameplayers array back to user in the same room that emitted the msg to the server
		})		
	})


	socket.on("set board", board => {
		io.emit("board settings", board);
	})

}


//mongodb get online users function
function onlineUsers(){
	return userModel.find({"online":true})
}

//mongodb update user to online status function
function loginUser (email,socket){
	return userModel.update({"email":email},{ $set: { "online": true, "socket":socket } })
}

//mongodb update user to offline status function
function logoutUser (email){
	return userModel.update({"email":email},{ $set: { "online": false } })
}

function findUserBySocket(socket){
	return userModel.find({socket:socket})
}
//sets up the SocketManager function for the socket that has been picked up
io.on("connection",SocketManager);



