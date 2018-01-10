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
        this.state = {
            gamePlayers:[]
        }
    }

    componentWillReceiveProps(){
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
                            this.props.history.push("/home");
                            return;
                        } else if( res.data === "you have been added to this room as an opponent"){
                            this.gameConnect()
                        }
                    });
        } else {
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
                                    this.props.history.push("/home");
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

    componentDidMount () {
        const room = this.props.match.params.id;
        const socket = this.props.socket;
        socket.on(`game_connect_${room}`,gamePlayers=>this.setState({gamePlayers}));
        if(this.props.user){this.gameConnect()}
    }

    home = () => {
        this.props.history.push("/home");
    }

    gameConnect = () => {
        const room = this.props.match.params.id;
        const socket = this.props.socket;
        const email = this.props.user.email;
        const username = email.substr(0,email.indexOf("@"));
        socket.emit("game connect",{room,username});
    }

    renderPage = () => {
        const {socket,user} = this.props;
        const currEmail = this.props.user.email;
        const currUsername = currEmail.substr(0,currEmail.indexOf("@"));
        return (
            <main>
                <div className="right">
                    <Button type="submit" id="homeBtn" className = "btn orange lighten-1 waves-effect waves-light z-depth-5" onClick={this.home} style={{margin:"12px"}}>Home</Button>  
                    <Button type="submit" id="logOutBtn" className = "btn orange lighten-1 waves-effect waves-light z-depth-5" onClick={this.props.logOut}>Logout</Button>  
                </div>

                <Board
                    socket={socket}
                />

                <SideNav
                    trigger={ <a  id="gameChatBtn"  className="btn-floating btn-large waves-effect waves-light orange lighten-1"><i className="material-icons">chat_bubble_outline</i></a>}
                    options={{ closeOnClick: true }}>
                    <SideNavItem userView
                        user={{
                            background:'https://i.stack.imgur.com/rJzOY.jpg',
                            image: 'http://lorempixel.com/400/200/',
                            name: this.props.user.displayName,
                            email: this.props.user.email
                            }}/>
                    <SideNavItem href='#!icon' icon='person_pin'>My Profile</SideNavItem>
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
                
                <Footer id = "LogInFooter" copyrights="&copy 2017 SuperGroup"
                    className="light-green"
                    links={
                    <ul>
                        <li><a className="grey-text text-lighten-3" href="https://github.com/AaronA05" target="_blank" rel="noopener noreferrer">Aaron Arndt</a></li>
                        <li><a className="grey-text text-lighten-3" href="https://github.com/satsumao" target="_blank" rel="noopener noreferrer">Matthew Duckworth</a></li>
                        <li><a className="grey-text text-lighten-3" href="https://github.com/PhilipK2" target="_blank" rel="noopener noreferrer">Philip Kappaz II</a></li>
                        <li><a className="grey-text text-lighten-3" href="https://github.com/sranney" target="_blank" rel="noopener noreferrer">Spencer Ranney</a></li>
                    </ul>
                    }>
                        <h5 className="white-text">Final Project: Check your Checkers</h5>
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