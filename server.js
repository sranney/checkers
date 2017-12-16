const express = require("express");
const app = express();
const http = require("http");
const socketIO = require("socket.io");

//localhost port
const port = 8000;

//our server instance
const server = http.createServer(app);

//this creates our socket using the instance of the server
const io = socketIO(server);

io.on("connection",socket => {
	console.log(socket.id);
	console.log("User connected");

	socket.on("change color",(color)=>{
		console.log(`color changed to: ${color}`);
		io.sockets.emit("change color", color);
	})

	socket.on("new message",(msg)=>{
		console.log(`new message`);
		io.sockets.emit("new message", msg);
	})

	socket.on("disconnect",() => {
		console.log("user disconnected");
	});
});

server.listen(port,()=>console.log(`listening on port ${port}`))