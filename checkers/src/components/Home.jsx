//react stuff
import React from "react";
import {Redirect} from "react-router";
import {Link} from "react-router-dom";

//materialize
import {Button, Modal, SideNavItem, SideNav, Card, CardTitle, Input, Footer} from 'react-materialize';
import 'materialize-css';

//axios http handler
import axios from "axios";

//components
import ChatModal from "./Chat-Home";

class Home extends React.Component {

    constructor(props){
        super(props);
        this.sendInvite = this.sendInvite.bind(this);
        this.personalizedLink = "";
    }

    sendInvite = (e) =>{
        e.preventDefault();
        axios.post("/sendInvite",{
            fromEmail : this.props.user.email,
            fromName : this.props.user.displayName,
            toEmail : this.toEmailAddress.value,
            msgBody : this.msgBody.value,
            gameLink : this.personalizedLink
        })
            .then((res)=>{
                console.log("success")
            })
            .catch((err)=>{

            })
    }

    render(){
        let email=null;
        let name=null;
        if(this.props.user){
            email=this.props.user.email;
            name=this.props.user.displayName;
        }
        const personalizedgameid = email? `/GamePage/${email.substr(0,email.indexOf("@"))}` : null;
        this.personalizedLink = personalizedgameid? window.location.href.replace("/home","")+personalizedgameid:null;
        return (
        
this.props.user?

<main>  
    <Button 
        type="submit" 
        id="logOutBtn" 
        className = "btn orange lighten-1 waves-effect waves-light z-depth-5" 
        onClick={this.props.logOut}>
        Logout
    </Button>       
    <div className="container">
        <div className="jumbotron text-center"></div>
    <Card className='small'
	    header={<CardTitle id="h2h" image='http://www.cityrider.com/fixed/43aspect.png' >
        <span class="orange-text text-lighten-1"><h2>Head to Head</h2></span></CardTitle>}

	    actions={[<SideNav
                    trigger={<Button className = "btn light-green waves-effect waves-light z-depth-2">Choose your opponent</Button>}
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
                    <SideNavItem subheader>Online Users</SideNavItem>
                    <SideNavItem divider />
                    {this.props.onlineUsers.map((user,idx) => {
                        const currUser = this.props.user.email;
                        const currUsername = currUser.substr(0,currUser.indexOf("@"));
                        const onlineUser = user.email;
                        const onlineUsername = onlineUser.substr(0,onlineUser.indexOf("@"));
                        if(currUser !== onlineUser){//if it isn't the currently logged in user show a modal button to talk to that person
                            return (                        
                                    <SideNavItem href='#!icon' icon='face' key={idx}>{onlineUsername}{/*display their name*/}
                                        {/*where is this chat modal mounted*/}
                                        {/*who's browser is this modal on*/}
                                        {/*other online user that communicates with online user with this modal*/}
                                        {/*socket used for real-time comm --passed from app.js*/}
                                        <ChatModal 
                                            location={this.props.location.pathname}
                                            currUser={this.props.user} 
                                            user={user}
                                            socket={this.props.socket}
                                        />
                                    </SideNavItem>
                                )
                            } else {//otherwise just show the currently online user's name
                                return <SideNavItem href='#!icon' icon='face' key={idx}>{currUsername}</SideNavItem>;
                            }
                        }
                    )
                    }
                </SideNav>]}>
        <p>Challenge an opponent by clicking here!</p>
    </Card>
    <br/>

    <Card className="small"
        header={<CardTitle reveal image={"http://www.cityrider.com/fixed/43aspect.png"} waves='light'/>}
		title={<span class="orange-text text-lighten-1">Invite a Friend</span>}
		reveal={
            <form onSubmit={this.sendInvite}>
                <br/>
                <p>Send this link to a friend by via email</p>
                <Link to={personalizedgameid}>{this.personalizedLink}</Link>
                <input type="text" className = "input-field" id="friendEmail"ref={(input)=>this.toEmailAddress=input} placeholder="enter friend's email here" name="friendEmail"/>
                Enter an invite message here
                <textarea ref={(input)=>this.msgBody=input}>{`${name} has invited you to play checkers with him at checkers.com.`}</textarea>
                <Button type="submit" className = "btn orange lighten-1 waves-effect waves-light z-depth-2">Send Invite!</Button>
            </form>
            }
    >
    </Card>
    </div>
    <br/>

    <Footer copyrights="&copy 2017 SuperGroup"
            className="light-green"
            links={
                <ul>
                    <li><a key={1} className="grey-text text-lighten-3" href="https://github.com/AaronA05" target="_blank" rel="noopener noreferrer">Aaron Arndt</a></li>
                    <li><a key={2} className="grey-text text-lighten-3" href="https://github.com/satsumao" target="_blank" rel="noopener noreferrer">Matthew Duckworth</a></li>
                    <li><a key={3} className="grey-text text-lighten-3" href="https://github.com/PhilipK2" target="_blank" rel="noopener noreferrer">Philip Kappaz II</a></li>
                    <li><a key={4} className="grey-text text-lighten-3" href="https://github.com/sranney" target="_blank" rel="noopener noreferrer">Spencer Ranney</a></li>
                </ul>
                }>
                <h5 className="white-text">Final Project: Check your Checkers</h5>
                <p className="grey-text text-lighten-4">2017 Fall Cohort of the SMU Coding Bootcamp</p>
    </Footer>   
    </main>
:
<Redirect to="/"/>

)}
}
export default Home