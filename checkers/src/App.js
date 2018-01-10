//react
import React, { Component } from 'react';
//react-router
import { Router, Route, Switch, Redirect } from 'react-router';

//components
import LogIn from "./components/LogIn";
import Home from "./components/Home";
import GamePlayPage from "./components/GamePage";

//firebase for authentication
import {auth} from "./firebase";

//other modules' imports
import axios from "axios";

//socket.io configuration stuff
import io from "socket.io-client";
const socketUrl = "https://react-socketio-checkers.herokuapp.com";

class NotFound extends React.Component {//component for 404
  render(){
    return (<div>Not Found</div>);
  }
 }

class App extends Component {
  constructor(){
    super();
    this.setUser = this.setUser.bind(this);
    this.initSocket = this.initSocket.bind(this);
    this.logOut = this.logOut.bind(this);
    this.authState = false;
    this.state={
      socket:null,
      user:null,
      onlineUsers:[]
    }
  }

  componentWillMount(){
    auth.onAuthStateChanged(this.setUser);
    this.initSocket();
  }

  initSocket = () => {
    const socket = io(socketUrl);
    socket.on("user connected",onlineUsers=>{
      this.setState({onlineUsers});
    });

    this.setState({socket});
  }

  setUser = (user) => {
    //user is logged in and this function has not run yet
    if(user&&!this.authState){
      this.setState({user});
      this.state.socket.emit("user connected",user);
      axios.post("/login",user); 
      this.authState = true;
    } else if(user){
      this.setState({user});
      this.state.socket.emit("user connected",user);
    } else if(!user){
      this.setState({user:null});
    }
  }

  logOut = () => {
    console.log("here");
    auth.signOut()
      .then(() => {
        this.state.socket.emit("logout",this.state.user);
        this.setState({
          user: null
        });
      });
  }

  render() {
    return (
    <div className="app">
      <Switch>
        <Route 
          exact path="/" 
          render={(routeProps) => (
            <LogIn 
              {...routeProps} 
              setUser={this.setUser} 
              user={this.state.user}
            />
          )}
        />
        <Route 
          exact path="/home" 
          render = {(routeProps) => (
            <Home 
              {...routeProps}
              socket = {this.state.socket}
              user = {this.state.user}
              onlineUsers = {this.state.onlineUsers}
              logOut = {this.logOut}
            />
          )}
        />
        <Route 
          exact path= "/gamepage/:id" 
          render = {(routeProps) => (
            <GamePlayPage
              {...routeProps}
              socket={this.state.socket}
              user = {this.state.user}
              logOut = {this.logOut}
            />
          )}
        />
        <Route component = {NotFound} />
      </Switch>
    </div>
    )
  }
}
export default App;
