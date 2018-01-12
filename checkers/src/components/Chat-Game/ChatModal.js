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

        const {location,currUser,user,socket} = this.props;

        this.lastUpdateTime=null;

        this.Send = this.Send.bind(this);
        this.initiateTyping = this.initiateTyping.bind(this);
        this.sendTyping = this.sendTyping.bind(this);
        this.startCheckingTyping = this.startCheckingTyping.bind(this);
        this.stopCheckingTyping = this.stopCheckingTyping.bind(this);
        this.scrollToBottom = this.scrollToBottom.bind(this);

        this.state = {
            socket,
            location,
            msgs:[],
            currUsername:currUser,
            otherUsername:user,
            isTyping:false,
            typer:null,
            typingMessage:null
        }
    }
    componentDidMount(){

        const {currUsername,otherUsername,socket,location} = this.state;

        const socketListenerID = `game_${location.replace("/GamePage/","")}`;
        console.log("socketListenerID: "+socketListenerID);
        socket.on(`chat_${socketListenerID}`,msgObj=>{//pick new chat message up from server emit
            console.log(msgObj);
            const {msgs} = this.state;
            msgs.push(msgObj);
            this.setState({msgs});
        })
        socket.on(`typing_${socketListenerID}`,(typingRes)=>{//pick typing up from server emit
            console.log("typing detected");
            console.log("result: "+typingRes);
            if(typingRes===false){
                this.setState({typingMessage:null})
            } else if(typingRes!==currUsername){//not the current user's name
                this.setState({typingMessage:`${typingRes} is typing`})//joe schmo is typing
            }
        })        
        const ChatPull = axios.post("/chats-game",{location,currUsername,otherUsername});
        ChatPull.then(res=>{
            const msgs = res.data;
            this.setState({msgs});
        })
        
        this.scrollToBottom();
    }

    componentDidUpdate(prevProps,prevState){
        this.scrollToBottom();
    }

    Send=(e)=>{
        e.preventDefault();
        const msg = this.msg.value;
        const {currUsername,otherUsername,socket,location} = this.state;
        const gameId = location.replace("/GamePage/","");

        const msgObj = {
            location : gameId,
            sender : currUsername,
            to : otherUsername,
            message:msg
        };

        socket.emit("chat-game",msgObj);
        this.msgForm.reset();

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
        const {currUsername,socket,location} = this.state;
		socket.emit("typing-game",{currUsername,location,isTyping})//on home page, chats are best distinguished by the parties involved - the current user that sends this socket event message will also be the one typing
	}	

	//triggered to start check typing
	startCheckingTyping= () => {
        console.log("setting check for typing");
		this.typingInterval = setInterval(()=>{//creates an interval to check whether user has been typing in intervals of 300 ms - checks by looking at this.lastUpdateTime which is set every time that initiateTyping is triggered - this is triggered every time there is a keyup event in the input box of the form in the modal
			if((Date.now() - this.lastUpdateTime) > 500){
				this.setState({isTyping:false});//if time between now and last typing has been longer than 500 ms than I recognize this as a break in typing time
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

    scrollToBottom(){
        const {gameChatBox} = this.refs;
        if(this.refs.gameChatBox){    
            gameChatBox.scrollTop = gameChatBox.scrollHeight
        }
    }

    render() {
        const {currUser,user,socket,location} = this.props;
        const currUserEmail = location==="/home" ? currUser.email:null;
        const currUsername = location==="/home" ? currUserEmail.substr(0,currUserEmail.indexOf("@")):currUser;
        return(
            <Modal bottomSheet
                header = {<h2>{`Your conversation with ${this.props.user}`}</h2>}
                trigger={<Button className = " btn light-green waves-effect waves-light" id="chat" icon='chat_bubble_outline'></Button>}>
                <div>
                    <div ref="gameChatBox" className="card-panel grey darken-3 chatBox">
                        {
                            this.state.msgs.map((msg,indx)=>{
                                return(
                                    msg.message.substr(0,10) !== "/GamePage/" ?
                                        <span key={indx} className={msg.sender === currUsername ? "orange-text text-lighten-1" : "blue-text text-lighten-5"}><p>{msg.message}</p></span>
                                    :
                                        <span key={indx} className={msg.sender === currUsername ? "orange-text text-lighten-1" : "blue-text text-lighten-5"}><Link to={msg.message}>Click here to enter my game room!</Link></span>
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
                    </form>
                </div>
            </Modal>        
        )
    }
}