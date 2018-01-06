import React from "react";
import {Button, Icon, Modal, SideNavItem, SideNav, Footer} from 'react-materialize';
import 'materialize-css';
import "./LogIn.css";
import {googleProvider,twitterProvider,facebookProvider,auth} from "../firebase";
import {Redirect} from "react-router";

class LogIn extends React.Component{

  constructor(props){
    super(props);
    this.authenticate = this.authenticate.bind(this);
  }

  authenticate = (provider)=>{
    let providerApp="";
    switch(provider){
      case "twitter":
        providerApp = twitterProvider;
        break;
      case "google":
        providerApp = googleProvider;
        break;
      case "facebook":
        providerApp = facebookProvider;
        break;
      default:
        providerApp="";
        break;
    }
    auth.signInWithPopup(providerApp)
      .then((result)=>{
        console.log(result);
        console.log(result.user);
        this.props.setUser(result.user);
        this.props.history.push("/home");
      })
  }

  render(){
    return (
  this.props.user?
  <Redirect to="/home"/>
  :
  <main>
    <div className="jumbotron text-center"></div>
  <center>
    <br/>
    <div className="container">
      <div>
        <Button className = "btn-large red waves-effect waves-light z-depth-5" onClick={()=>this.authenticate("google")}><i className="fab fa-google fa-2x" ></i> Log in With Google</Button>
        <br />
        <Button className = "btn-large blue lighten-1 waves-effect waves-light z-depth-5" onClick={()=>this.authenticate("twitter")}><i className="fab fa-twitter fa-2x"></i> Log in With twitter</Button>
        <br />
        <Button className = "btn-large indigo darken-1 waves-effect waves-light z-depth-5" onClick={()=>this.authenticate("facebook")}><i className="fab fa-facebook-f fa-2x"></i> Log in With facebook</Button>
      </div> 
    </div>
  </center>

  <Footer id = "LogInFooter" copyrights="&copy 2017 SuperGroup"
      className="light-green"
      links={
        <ul>
          <li><a className="grey-text text-lighten-3" href="https://github.com/AaronA05" target="_blank">Aaron Arndt</a></li>
          <li><a className="grey-text text-lighten-3" href="https://github.com/satsumao" target="_blank">Matthew Duckworth</a></li>
          <li><a className="grey-text text-lighten-3" href="https://github.com/PhilipK2" target="_blank">Philip Kappaz II</a></li>
          <li><a className="grey-text text-lighten-3" href="https://github.com/sranney" target="_blank">Spencer Ranney</a></li>
        </ul>
        }>
          <h5 className="white-text">Final Project: Check your Checkers</h5>
          <p className="grey-text text-lighten-4">2017 Fall Cohort of the SMU Coding Bootcamp</p>
  </Footer>   
  </main>
  )
  }
}
export default LogIn
