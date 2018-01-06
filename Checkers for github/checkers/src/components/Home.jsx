import React from "react";
import {Redirect} from "react-router";
import {Link} from "react-router-dom";

//materialize
import {Button, Icon, Modal, SideNavItem, SideNav, Card, CardTitle, Input, Footer} from 'react-materialize';
import 'materialize-css';

//axios http handler
import axios from "axios";

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
    <div className="container">
        <div className="jumbotron text-center"></div>
    <Card className='small'
	    header={<CardTitle id="h2h" image='http://www.cityrider.com/fixed/43aspect.png' >
        <span class="orange-text text-lighten-1"><h2>Head to Head</h2></span></CardTitle>}

	    actions={[<SideNav
                    trigger={<Button className = "btn light-green waves-effect waves-light">Choose your opponent</Button>}
                    options={{ closeOnClick: true }}>
                    <SideNavItem userView
		                user={{
                            background:'https://i.stack.imgur.com/rJzOY.jpg',
                            image: 'http://lorempixel.com/400/200/',
                            email: 'jdandturk@gmail.com'
		                    }}/>
                    <SideNavItem href='#!icon' icon='person_pin'>My Profile</SideNavItem>
                    <SideNavItem divider />
                    <SideNavItem subheader>Online Users</SideNavItem>
                    <SideNavItem divider />
                    {this.props.onlineUsers.map((user,idx) => {
                            return (                        
                                <SideNavItem href='#!icon' icon='face' key={idx}>{user.displayName}
                                    <Modal bottomSheet
                                        header = {<h2>{`Your conversation with ${user.displayName}`}</h2>}
                                        trigger={<Button className = " btn light-green waves-effect waves-light" id="chat" icon='chat_bubble_outline'></Button>}>
                                        <div className="card-panel grey darken-3">
                                            <span class="orange-text text-lighten-1"><p>Say bro, you down to brawl?</p></span>
                                            <br/>
                                            <span class="blue-text text-lighten-5"><p>Brah, you know I'm always down to brawl.</p></span>
                                            <br/>
                                            <span class="orange-text text-lighten-1"><p>Brawl Time!!!!!!!</p></span>
                                            <br/>
                                            <span class="blue-text text-lighten-5"><p>....Start the game bro.</p></span>
                                            <br/>
                                        </div>
                                        <br/>
                                        <Input for="text" label="Type your message here" />
                                    </Modal>
                                </SideNavItem>
                            )
                        }
                    )
                    }
                </SideNav>]}>

        <p>Go head to head with an opponent by clicking here!</p>
    </Card>
    <br/>

    <Card className="small"
        header={<CardTitle reveal image={"http://www.cityrider.com/fixed/43aspect.png"} waves='light'/>}
		title={<span class="orange-text text-lighten-1">Invite a Friend</span>}
		reveal={
            <form onSubmit={this.sendInvite}>
                <p>Send this link to a friend by filling out our email form</p>
                <Link to={personalizedgameid}>{this.personalizedLink}</Link>
                <input type="text" ref={(input)=>this.toEmailAddress=input} placeholder="enter friend's email here" name="friendEmail"/>
                Enter an invite message here
                <textarea ref={(input)=>this.msgBody=input}>{`${name} has invited you to play checkers with him at checkers.com.`}</textarea>
                <button type="submit">Send Invite!</button>
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
                    <li><a key={1} className="grey-text text-lighten-3" href="https://github.com/AaronA05" target="_blank">Aaron Arndt</a></li>
                    <li><a key={2} className="grey-text text-lighten-3" href="https://github.com/satsumao" target="_blank">Matthew Duckworth</a></li>
                    <li><a key={3} className="grey-text text-lighten-3" href="https://github.com/PhilipK2" target="_blank">Philip Kappaz II</a></li>
                    <li><a key={4} className="grey-text text-lighten-3" href="https://github.com/sranney" target="_blank">Spencer Ranney</a></li>
                </ul>
                }>
                <button onClick={this.props.logOut}>Logout</button>
                <h5 className="white-text">Final Project: Check your Checkers</h5>
                <p className="grey-text text-lighten-4">2017 Fall Cohort of the SMU Coding Bootcamp</p>
    </Footer>   
    </main>
:
<Redirect to="/"/>

)}
}
export default Home