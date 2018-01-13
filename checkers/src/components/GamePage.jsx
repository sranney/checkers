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

    renderPage = () => {
        const {gamePlayers} = this.state;
        const {socket,user} = this.props;
        const currEmail = this.props.user.email;
        const currUsername = currEmail.substr(0,currEmail.indexOf("@"));
        const room = this.props.match.params.id;       
        return (
            <main>
                <div id="nav" className="right"> 

                    <SideNav
                    trigger={ <Button id="gameChatBtn"  className="btn orange lighten-1 waves-effect waves-light z-depth-5">Menu</Button>}
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