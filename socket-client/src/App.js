import React, { Component } from 'react';
import socketIOClient from "socket.io-client";
import MsgForm from "./MsgForm";

class App extends Component {
  constructor() {
    super();
    this.newMsg = "";
    this.socket = socketIOClient("http://localhost:8000");
    this.state = {
      msgs:[]
    };
  }
  componentDidMount = () =>{
    alert("mounted");
    this.socket.on("new message",(msg)=>{
      let msgs = this.state.msgs;
      msgs.push(msg);
      this.setState({msgs:msgs});
    })
    
  }
  handleChange = (event) => {
    this.newMsg= event.target.value;
  }

  handleSubmit = (event) => {
    alert(this.state.msgs);
    event.preventDefault();
    this.socket.emit("new message",this.newMsg);
  }

  render() {
    

    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <label>
            Name:
            <input type="text" value={this.state.value} onChange={this.handleChange} />
          </label>
          <input type="submit" value="Submit" />
        </form>
        <div id="chat">
          {this.state.msgs.map((msg,idx)=>{
            return <div key={idx}>{msg}</div>;
          })}
        </div>
      </div>
    )
  }
}

export default App;
