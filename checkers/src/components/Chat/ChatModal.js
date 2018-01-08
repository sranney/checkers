//react stuff
import React from "react";

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
        this.state = {
            msgs:[]
        }
    }
    componentDidMount(){
        const {currUser,user,socket,location} = this.props;
        const currUserEmail = currUser.email;
        const currUsername = currUserEmail.substr(0,currUserEmail.indexOf("@"));
        const otherUserEmail = user.email;
        const otherUsername = otherUserEmail.substr(0,otherUserEmail.indexOf("@"));
        
        const socketListenerID = location === "/home" ? `${currUsername}_${otherUsername}` : `game_${location.path.replace("/GamePage/","")}`;
        socket.on(`chat_${socketListenerID}`,msgObj=>{
            const {msgs} = this.state;
            msgs.push(msgObj);
            this.setState({msgs});
        })

        const ChatPull = location ==="/home" ? axios.post("/chats-home",{currUsername,otherUsername}) : axios.post("/chats-game",{location});
        ChatPull.then(res=>{
            const msgs = res.data;
            this.setState({msgs});
        })
    }
    Send=(e)=>{
        e.preventDefault();
        const msg = this.msg.value;
        const {currUser,user,socket} = this.props;
        const currUserEmail = currUser.email;
        const currUsername = currUserEmail.substr(0,currUserEmail.indexOf("@"));
        const otherUserEmail = user.email;
        const otherUsername = otherUserEmail.substr(0,otherUserEmail.indexOf("@"));
        const msgObj = {
            message : msg,
            sender : currUsername,
            to : otherUsername
        }
        
        this.props.location === "/home" ? socket.emit("chat-home",msgObj) : socket.emit("chat-game",msgObj);
        this.msgForm.reset();
    }
    render() {
        const {currUser,user,socket} = this.props;
        const currUserEmail = currUser.email;
        const currUsername = currUserEmail.substr(0,currUserEmail.indexOf("@"));
        return(
            <Modal bottomSheet
                header = {<h2>{`Your conversation with ${this.props.user.displayName}`}</h2>}
                trigger={<Button className = " btn light-green waves-effect waves-light" id="chat" icon='chat_bubble_outline'></Button>}>
                <div>
                    <div className="card-panel grey darken-3 chatBox">
                        {
                            this.state.msgs.map((msg,indx)=>{
                                return(
                                    msg.sender === currUsername ? 
                                        <span key={indx} class="orange-text text-lighten-1"><p>{msg.message}</p></span>
                                    :
                                        <span key={indx} class="blue-text text-lighten-5"><p>{msg.message}</p></span>
                                )
                            })
                        }
                    </div>
                    <form ref={input => this.msgForm = input} onSubmit={this.Send}>
                        <div>
                            <label for="msg">Enter Message Here</label>
                            <input name="msg" id="msg" ref={input => this.msg=input}/>
                        </div>
                        <button type="submit">Send Message</button>
                    </form>
                </div>
            </Modal>        
        )
    }
}