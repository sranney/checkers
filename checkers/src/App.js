//react
import React, { Component } from 'react';
//react-router
import { Router, Route, Switch, Redirect } from 'react-router';

//components
import LogIn from "./components/LogIn";
import Home from "./components/Home";
import GamePlayPage from "./components/GamePage";
import NoVacancy from "./components/NoVacancy";
import Expelled from "./components/Expelled";
import Leave from "./components/Leave";
import Rankings from "./components/Rankings";

//firebase for authentication
import {auth} from "./firebase";

//other modules' imports
import axios from "axios";

//socket.io configuration stuff
import io from "socket.io-client";
const socketUrl = "http://localhost:5000";

class NotFound extends React.Component {//component for 404
  render(){
    return (<div>No Page Here</div>);
  }
 }

class App extends Component {
  constructor(){
    super();
    //binding this for each of these functions to ensure "this" context
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

  //setting up auth state check to be ran in component lifecycle function
  componentWillMount(){
    auth.onAuthStateChanged(this.setUser);
    //also establishing web socket connection with server here
    this.initSocket();
  }
  //setting up socket and listener for "user connected" which will update application state piece onlineUsers to keep track of users online
  initSocket = () => {
    const socket = io();
    socket.on("user connected",onlineUsers=>{
      console.log(onlineUsers);
      this.setState({onlineUsers});
    });
    //keeping track of socket to keep track of socket id - only one socket is set up for the entire application because this is a spa
    this.setState({socket});
  }
  //function that is called as a callback when firebase auth state has changed (which is configured in the componentWillMount function)
  setUser = (user) => {
    //user is logged in and this function has not run yet (captured by this.authState being false)
    if(user&&!this.authState){
      //set user to be the user object returned from firebase onAuthStateChanged function
      this.setState({user});
      //socket emit to server a new user connected event with the user data that is returned from firebase - important for updating online users
      this.state.socket.emit("user connected",user);
      //doing a seperate request to endpoint "/login" to ensure that if this is a new user that data is stored in mongodb for it and that a gameroom is set up for the user
      axios.post("/login",user); 
      //setting authState to be true so that this function only runs once
      this.authState = true;
    } else if(user){
      //not caused from new login, maybe a page refresh
      //nevertheless, need to set state here for the user
      this.setState({user});
      //and emit to the server that a user is connected for the online users arr
      this.state.socket.emit("user connected",user);
    } else if(!user){
      this.setState({user:null});
    }
  }

  //method passed to each component to log user out using firebase signOut function
  logOut = () => {
    auth.signOut()
      .then(() => {
        //after promise has been fulfilled, sending socket emit to server to update online users
        this.state.socket.emit("logout",this.state.user);
        //setting application state's user value to null - this will move users back to sign in page
        this.setState({
          user: null
        });
      });
  }

  //
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
              socket = {this.state.socket}
              user = {this.state.user}
              logOut = {this.logOut}
            />
          )}
        />
        <Route 
          exact path="/NoVacancy"
          render = {(routerProps) => (
            <NoVacancy
              {...routerProps}
              
            />
          )}
        />
        <Route 
          exact path="/Expel"
          render = {(routerProps) => (
            <Expelled
              {...routerProps}
            />
          )}
        />       
        <Route 
          exact path="/Leave"
          render = {(routerProps) => (
            <Leave
              {...routerProps}
            />
          )}
        />
        <Route 
          exact path="/Rankings"
          render = {(routerProps) => (
            <Rankings
              {...routerProps}
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
