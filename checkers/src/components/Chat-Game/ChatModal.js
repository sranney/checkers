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
        this.renderSendRoomLinkButton = this.renderSendRoomLinkButton.bind(this);
        this.state = {
            msgs:[]
        }
    }
    componentDidMount(){

        const {currUser,user,socket,location} = this.props;
        let currUsername = "";
        let otherUsername = "";
        if(location ==="/home") {
            const currUserEmail = currUser.email;
            const currUsername = currUserEmail.substr(0,currUserEmail.indexOf("@"));
            const otherUserEmail = user.email;
            const otherUsername = otherUserEmail.substr(0,otherUserEmail.indexOf("@"));
        }
        else {
            currUsername = currUser;
            otherUsername = user;
        }
        console.log(location);
        console.log(location.path);
        console.log(`game_${location.replace("/GamePage/","")}`);
        const socketListenerID = location === "/home" ? `${currUsername}_${otherUsername}` : `game_${location.replace("/GamePage/","")}`;
        socket.on(`chat_${socketListenerID}`,msgObj=>{
            console.log(msgObj);
            const {msgs} = this.state;
            msgs.push(msgObj);
            this.setState({msgs});
        })
        const ChatPull = location ==="/home" ? axios.post("/chats-home",{currUsername,otherUsername}) : axios.post("/chats-game",{location,currUsername,otherUsername});
        ChatPull.then(res=>{
            const msgs = res.data;
            this.setState({msgs});
        })
    }
    Send=(e)=>{
        e.preventDefault();
        const msg = this.msg.value;
        const {currUser,user,socket,location} = this.props;
        let currUsername = "";
        let otherUsername = "";
        let gameId = "";
        if(location ==="/home") {
            const currUserEmail = currUser.email;
            currUsername = currUserEmail.substr(0,currUserEmail.indexOf("@"));
            const otherUserEmail = user.email;
            otherUsername = otherUserEmail.substr(0,otherUserEmail.indexOf("@"));
        }
        else {
            currUsername = currUser;
            otherUsername = user;
            gameId = location.replace("/GamePage/","");
        }
        const msgObj = 
        location ==="/home" ?      
            {
                message : msg,
                sender : currUsername,
                to : otherUsername
            }
        : 
        {
            location : gameId,
            sender : currUsername,
            to : otherUsername,
            message:msg
        };

        this.props.location === "/home" ? socket.emit("chat-home",msgObj) : socket.emit("chat-game",msgObj);
        this.msgForm.reset();
    }
    SendRoomLink=()=>{
        const {currUser,user,socket,location} = this.props;
        const currUserEmail = currUser.email;
        const currUsername = currUserEmail.substr(0,currUserEmail.indexOf("@"));
        const msg = `/GamePage/${currUsername}`;
        const otherUserEmail = user.email;
        const otherUsername = otherUserEmail.substr(0,otherUserEmail.indexOf("@"));
        const msgObj = {
            message : msg,
            sender : currUsername,
            to : otherUsername
        }        
        socket.emit("chat-home",msgObj);
    }    

    renderSendRoomLinkButton = () => {
        return (
            <Button
                className = "btn light-green waves-effect waves-light z-depth-2"
                onClick = {this.SendRoomLink}
            >
            Send Message
            </Button>
        )
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
                    <div className="card-panel grey darken-3 chatBox">
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
                    <form ref={input => this.msgForm = input} onSubmit={this.Send}>
                        <div>
                            <label for="msg">Enter Message Here</label>
                            <input name="msg" id="msg" ref={input => this.msg=input}/>
                        </div>
                        <Button className = "btn light-green waves-effect waves-light z-depth-2">Send Message</Button>
                        {location === "/home" ? this.renderSendRoomLinkButton() : null}                        
                    </form>
                </div>
            </Modal>        
        )
    }
}