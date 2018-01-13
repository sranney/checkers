//react
import React, {Component} from "react";
import {Redirect} from "react-router";

//other modules
import axios from "axios";
import {Button, Modal, SideNavItem, SideNav, Input, Footer} from 'react-materialize';
// import 'materialize-css';

//components
import Board from './Board';
import ChatModal from "./Chat-Game";
import Canvas from "./Canvas";

let pieces = [];
let numPieces = 25;
let lastUpdateTime = Date.now();

function randColor(){
    let colors = ["#f00","#0f0","#00f","#ff0","#f0f","#0ff"];
    return colors[Math.floor(Math.random()*colors.length)]
}

function update(){

    if(pieces.length>0){
        let now = Date.now();
        let deltaTime = now - lastUpdateTime;

        for ( let i = pieces.length - 1 ; i >= 0 ; i --) {
            let p = pieces[i];
            if(p.y > canvas.height){
                pieces.splice(i,1);
                continue;
            }
            p.y += p.gravity * deltaTime;
            p.rotation += p.rotationSpeed * deltaTime;
        }

        while(pieces.length<numPieces&&totalPieces<75){
            pieces.push(new Piece(Math.random() * canvas.width,-20));
            totalPieces++;
        }

        lastUpdateTime = now;			
        setTimeout(update,1);
        draw();
    } else {
        var canvasElmt = document.querySelector("canvas");
        document.querySelector("body").removeChild(canvasElmt);
        totalPieces = 0;
    }
}

function draw(){
    context.clearRect(0,0,canvas.width,canvas.height);
    pieces.forEach(function(p){
        context.save();
        
        context.fillStyle = p.color;

        context.translate(p.x+p.size/2,p.y+p.size/2);
        context.rotate(p.rotation);

        context.fillRect(-p.size/2,-p.size/2,p.size,p.size)

        context.restore();
    })
    requestAnimationFrame(draw);

}

function Piece(x,y){
    this.x = x;
    this.y = y;
    this.size = (Math.random() * 0.5 + 0.75) * 15;
    this.gravity = (Math.random() * 0.5 + 0.75) * .7;
    this.rotation = (Math.PI * 2) * Math.random();
    this.rotationSpeed = this.rotation * 0.005;
    this.color = randColor();
}


var dropConf = false,canvas,context,totalPieces=0;

class GamePlayPage extends Component {
    constructor(props){
        super(props);
        this.home = this.home.bind(this);
        this.renderPage = this.renderPage.bind(this);
        this.gameConnect = this.gameConnect.bind(this);
        this.CheckAndSetGame = this.CheckAndSetGame.bind(this);
        this.renderExpelButton = this.renderExpelButton.bind(this);
        this.expelOpponent = this.expelOpponent.bind(this);
        this.renderLeaveButton = this.renderLeaveButton.bind(this);
        this.leaveGame = this.leaveGame.bind(this);
        this.renderCanvas = this.renderCanvas.bind(this);
        this.state = {
            gamePlayers:[]
        }
    }

    componentWillMount(){
        this.CheckAndSetGame();
    }

    componentWillReceiveProps(){
        this.CheckAndSetGame();
    }

    componentDidMount () {
        const room = this.props.match.params.id;
        console.log(room);
        const socket = this.props.socket;
        //message returned from server in response to emitted message in function gameConnect
        //sets the gameplayers on the client
        socket.on(`game_connect_${room}`,gamePlayers=>this.setState({gamePlayers}));
        socket.on(`leave_${room}`,gameObj=>{
            this.gameConnect();
        })
        if(this.props.user){
            this.gameConnect();
            const {user} = this.props;
            const username = user.email.substr(0,user.email.indexOf("@"));
            if(room!==username){
                socket.on(`expel_${room}_${username}`,gameObj=>{//gameObj is an empty object
                    this.props.history.push("/Expel");
                })
            }
            console.log(room);

        }//if the user is logged in then run gameConnect to emit the message to check for users
    }

    CheckAndSetGame = () => {
        console.log("game check");
        const room = this.props.match.params.id;
        if(this.props.user){        
            const email = this.props.user.email;
            const username = email.substr(0,email.indexOf("@"));
            room === username ? 
                this.gameConnect()
            : 
                axios.post("/checkVacancy",{room,username})
                    .then(res=>{
                        if(res.data==="room does not exist"||res.data==="no vacancy"){
                            this.props.history.push("/NoVacancy");
                            return;
                        } else if( res.data === "you have been added to this room as an opponent"){
                            this.gameConnect()
                        }
                    });
        } else {//for just in case the user is not quite logged in yet, this will try again 1 second after the first attempt. if at that time, the user is still not logged in, re-route to home
            setTimeout(()=>{
                if(this.props.user){
                    const email = this.props.user.email;
                    const username = email.substr(0,email.indexOf("@"));
                    room === username ? 
                        this.gameConnect()
                    : 
                        axios.post("/checkVacancy",{room,username})
                            .then(res=>{
                                if(res.data==="room does not exist"||res.data==="no vacancy"){
                                    this.props.history.push("/NoVacancy");
                                    return;
                                } else if( res.data === "you have been added to this room as an opponent"){
                                    this.gameConnect()
                                }
                            });                    
                } else {
                    this.props.history.push("/");
                }
            },1000)
        }        
    }

    home = () => {
        this.props.history.push("/home");
    }

    gameConnect = () => {//determine whether a user can connect to a room
        const room = this.props.match.params.id;
        const socket = this.props.socket;
        const email = this.props.user.email;
        const username = email.substr(0,email.indexOf("@"));
        socket.emit("game connect",{room,username});
    }

    renderExpelButton = () => {
        return (
            <Button id="expelBtn" className = "btn orange lighten-1 waves-effect waves-light z-depth-2" onClick={this.expelOpponent}>Expel Opponent</Button>             
        )
    }

    expelOpponent = () => {
        const room = this.props.match.params.id;
        const {socket} = this.props;
        const {gamePlayers} = this.state;

        if( gamePlayers[1] !== "no opponent yet" && gamePlayers[1] !== undefined ){
            const opponent = gamePlayers[1];
            const roomInfo = {
                room,opponent
            }
            socket.emit("expel from game",roomInfo);
            this.gameConnect();
        }
        console.log(room);
        socket.emit("reset game",room);
    }

    renderLeaveButton = () => {
        return (
            <Button id="leaveBtn" className = "btn orange lighten-1 waves-effect waves-light z-depth-2" onClick={this.leaveGame}>Leave Game</Button>             
        )
    }

    leaveGame = () => {
        const room = this.props.match.params.id;
        const {socket,user} = this.props;
        const {gamePlayers} = this.state;
        const roomInfo = {
            room,user
        }
        socket.emit("leave game",roomInfo);
        socket.emit("reset game",room);
        this.gameConnect();
        this.props.history.push("/Leave");
    }

    renderCanvas = ()=>{
        dropConf = !dropConf;
        var canvasElmt = document.createElement("canvas");
        canvasElmt.setAttribute("id","confetti");
        document.querySelector("body").appendChild(canvasElmt);
        canvas = document.getElementById("confetti");
        canvas.width=window.outerWidth-20;
        canvas.height=window.innerHeight-20;
        context = canvas.getContext("2d");
        while(pieces.length < numPieces){
            pieces.push(new Piece(Math.random()*canvas.width,Math.random()*canvas.height));
            totalPieces++;
        }
        update();       
    }

    renderPage = () => {
        const {gamePlayers} = this.state;
        const {socket,user} = this.props;
        const currEmail = this.props.user.email;
        const currUsername = currEmail.substr(0,currEmail.indexOf("@"));
        const room = this.props.match.params.id;       
        return (
            <main style={{position:"relative"}}>
                <div id="nav" className="right"> 

                    <SideNav
                    trigger={ <Button  id="gameChatBtn"  className="btn orange lighten-1 waves-effect waves-light z-depth-5">Menu</Button>}
                    options={{ closeOnClick: true }}>
                    <SideNavItem userView
                        user={{
                            background:'https://i.stack.imgur.com/rJzOY.jpg',
                            image: 'http://lorempixel.com/400/200/',
                            name: this.props.user.displayName,
                            email: this.props.user.email
                            }}/>
                    <Button id="logOutBtn" className = "btn-small orange lighten-1 waves-effect waves-light z-depth-2" onClick={this.props.logOut}>Logout</Button>                   
                    <Button id="homeBtn" className = "btn-small orange lighten-1 waves-effect waves-light z-depth-2" onClick={this.home}> Home </Button>
                    {room === currUsername ? this.renderExpelButton() : this.renderLeaveButton()}
                    <SideNavItem divider />
                    <SideNavItem subheader>{this.props.match.params.id} Game Players</SideNavItem>
                    <SideNavItem divider />
                    {

                        this.state.gamePlayers.map((gameplayer,idx)=>{
                            if(currUsername !== gameplayer){
                                return (                        
                                    <SideNavItem href='#!icon' icon='face' key={idx}>{gameplayer}
                                        <ChatModal 
                                            location={this.props.location.pathname}
                                            currUser={currUsername} 
                                            user={gameplayer}
                                            socket={this.props.socket}
                                        />
                                    </SideNavItem>
                                )
                            } else {
                                return <SideNavItem href='#!icon' icon='face' key={idx}>{gameplayer}</SideNavItem>;
                            }
                        })
                    }
                </SideNav>
                </div>

                <Board
                    socket={socket}
                    room={room}
                    currUser={currUsername}
                    gamePlayers={gamePlayers}
                    renderCanvas={this.renderCanvas}
                />


                <Footer id = "LogInFooter" copyrights="&copy 2017 SuperGroup"
                    className="light-green"
                    links={
                    <ul>
                        <li><a className="grey-text text-lighten-3" href="https://github.com/AaronA05" target="_blank" rel="noopener noreferrer">Aaron Arndt</a></li>
                        <li><a className="grey-text text-lighten-3" href="https://github.com/PhilipK2" target="_blank" rel="noopener noreferrer">Philip Kappaz II</a></li>
                        <li><a className="grey-text text-lighten-3" href="https://github.com/sranney" target="_blank" rel="noopener noreferrer">Spencer Ranney</a></li>
                    </ul>
                    }>
                        <h5 className="white-text">Final Project: Check-Your-Checkers</h5>
                        <p className="grey-text text-lighten-4">2017 Fall Cohort of the SMU Coding Bootcamp</p>
                </Footer>
            </main>            
        )

    }

    render() {
        return ( 
            this.props.user? 
                this.renderPage()
            :
                setTimeout(()=>{
                    this.props.user?
                        this.renderPage()
                    :
                        <Redirect to="/home"/>
                },1000)
            );  


    }
    





}


export default GamePlayPage