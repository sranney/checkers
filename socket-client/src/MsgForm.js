import React, { Component } from 'react';
import socketIOClient from "socket.io-client";

class MsgForm extends Component {
  constructor(props) {
    super(props);
    this.state = {value: ''};

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange = (event) => {
    this.setState({newMsg: event.target.value});
  }

  handleSubmit = (event) => {
    event.preventDefault();
    const msg = this.state.newMsg;
    const socket = socketIOClient(this.state.endpoint);
    socket.emit("new message",msg);
  }


  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          Name:
          <input type="text" value={this.state.value} onChange={this.handleChange} />
        </label>
        <input type="submit" value="Submit" />
      </form>
    );
  }
}

export default MsgForm;