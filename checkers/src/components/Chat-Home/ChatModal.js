//react stuff
import React from "react";
import {Link} from "react-router-dom";

//materialize stuff
import {Button, Modal, SideNavItem, SideNav, Card, CardTitle, Input, Footer} from 'react-materialize';
import 'materialize-css';

//other modules
import axios from "axios";

//CSS for component
import './Chat.css';

export default class ChatModal extends React.Component {
    constructor(props){
        super(props);
        
        this.Send = this.Send.bind(this);
        this.SendRoomLink = this.SendRoomLink.bind(this);
        this.initiateTyping = this.initiateTyping.bind(this);
        this.sendTyping = this.sendTyping.bind(this);
        this.startCheckingTyping = this.startCheckingTyping.bind(this);
        this.stopCheckingTyping = this.stopCheckingTyping.bind(this);   

        const {currUser,user,socket,location} = this.props;
        const currUserEmail = currUser.email;
        const currUsername = currUserEmail.substr(0,currUserEmail.indexOf("@"));
        const otherUserEmail = user.email;
        const otherUsername = otherUserEmail.substr(0,otherUserEmail.indexOf("@"));

        this.lastUpdateTime=null;

        this.state = {
            socket,
            location,
            msgs:[],
            currUsername,
            otherUsername,
            isTyping:false,
            typer:null,
            typingMessage:null
        }
    }
    componentDidMount(){
        const {currUsername,otherUsername,msgs,socket} = this.state;
        const socketListenerID = `${currUsername}_${otherUsername}`;
        socket.on(`chat_${socketListenerID}`,msgObj=>{
            const msgs = this.state.msgs;
            msgs.push(msgObj);
            this.setState({msgs});
        })
        socket.on(`typing_home_${socketListenerID}`,(typingRes)=>{
            if(typingRes===false){
                this.setState({typingMessage:null})
            } else if(typingRes!==currUsername){//not the current user's name
                this.setState({typingMessage:`${typingRes} is typing`})//joe schmo is typing
            }
        })
        const ChatPull = axios.post("/chats-home",{currUsername,otherUsername});
        ChatPull.then(res=>{
            const msgs = res.data;
            this.setState({msgs});
        })
    }
    Send = (e) => {
        e.preventDefault();
        const msg = this.msg.value;
        const {currUsername,otherUsername,socket} = this.state;
        const msgObj = {
            message : msg,
            sender : currUsername,
            to : otherUsername
        }
        
        socket.emit("chat-home",msgObj);
        this.msgForm.reset();
    }
    SendRoomLink = () => {
        const {currUsername,otherUsername,socket} = this.state;
        const msg = `/GamePage/${currUsername}`;
        const msgObj = {
            message : msg,
            sender : currUsername,
            to : otherUsername
        }        
        socket.emit("chat-home",msgObj);
    }    

    //is triggered when the user releases first key
	initiateTyping = () => {
        console.log("key press triggered");
		this.lastUpdateTime=Date.now()
		if(!this.state.isTyping){
			this.setState({isTyping:true})
			this.sendTyping(true)
			this.startCheckingTyping()
		}
	}

   	//methods that are passed to message input from the parent that renders the message input
	sendTyping = (isTyping) => {
        console.log("is typing:",isTyping);
        const {currUsername,otherUsername,socket} = this.state;
		socket.emit("typing-home",{currUsername,otherUsername,isTyping})//on home page, chats are best distinguished by the parties involved - the current user that sends this socket event message will also be the one typing
	}	

	//triggered to start check typing
	startCheckingTyping= () => {
        console.log("setting check for typing");
		this.typingInterval = setInterval(()=>{//creates an interval to check whether user has been typing in intervals of 300 ms - checks by looking at this.lastUpdateTime which is set every time that initiateTyping is triggered - this is triggered every time there is a keyup event in the input box of the form in the modal
			if((Date.now() - this.lastUpdateTime) > 500){
				this.setState({isTyping:false});//if time between now and last typing has been longer than 300 ms than I recognize this as a break in typing time
				this.stopCheckingTyping()//and run the function which send an alert that typing has stopped
			}
		},500);
	}
    
	//calls sendTyping and sends to server a message that the user has stopped typing
	stopCheckingTyping = () => {
        console.log("stopping check for typing");
		if(this.typingInterval){//make sure that this is set before clearing it and sending a stopped typing message
			clearInterval(this.typingInterval);
			this.sendTyping(false)
		}
    }   
      
    render() {

        const {currUsername,otherUsername} = this.state;

        return(
            <Modal bottomSheet
                header = {<h2>{`Your conversation with ${otherUsername}`}</h2>}
                trigger={<Button className = " btn light-green waves-effect waves-light" id="chat" icon='chat_bubble_outline'></Button>}>
                <div>
                    <div className="card-panel grey darken-3 chatBox">
                        {
                            this.state.msgs.map((msg,indx)=>{
                                return(
                                    
                                        <span key={indx}>
                                            <p className={msg.sender === currUsername ? "orange-text text-lighten-1" : "blue-text text-lighten-5"}>
                                                {
                                                    msg.message.substr(0,10) !== "/GamePage/" ? 
                                                        msg.message
                                                    :
                                                        <Link className={msg.sender === currUsername ? "orange-text text-lighten-1" : "blue-text text-lighten-5"} to={msg.message}>Click here to enter my game room!</Link>
                                                }
                                            </p>
                                        </span>
                                )
                            })
                        }
                    </div>
                    <p>{this.state.typingMessage}</p>
                    <form ref={input => this.msgForm = input} onSubmit={this.Send}>
                        <div>
                            <label for="msg">Enter Message Here</label>
                            <input 
                                name="msg" 
                                id="msg" 
                                ref={input => this.msg=input}
                                onKeyUp={e=>{e.keyCode !== 13 && this.initiateTyping()}}
                            />
                        </div>
                        <Button className = "btn light-green waves-effect waves-light z-depth-2">Send Message</Button>
                        <Button
                            type="button"
                            className = "btn light-green waves-effect waves-light z-depth-2"
                            onClick = {this.SendRoomLink}
                        >
                            Send Room
                        </Button>                       
                    </form>
                </div>
            </Modal>        
        )
    }
}