import React from "react";
import {Button, Footer} from 'react-materialize';
// import 'materialize-css';
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
    <br/>
    <div className='container'>
    <div className="jumbotron text-center"></div>
  <center>
    <br/>
    <div className="container">
      <div>
        <Button className = "btn-large red waves-effect waves-light z-depth-5" onClick={()=>this.authenticate("google")}><i className="fab fa-google fa-2x" ></i> Log in With Google</Button>
      </div> 
    </div>
  </center>

  <Footer id = "LogInFooter" 
      copyrights="&copy 2017 SuperGroup"
      className="light-green"
      links={
        <ul>
          <li><a className="grey-text text-lighten-3" href="https://github.com/AaronA05" target="_blank"  rel="noopener noreferrer">Aaron Arndt</a></li>
          <li><a className="grey-text text-lighten-3" href="https://github.com/PhilipK2" target="_blank" rel="noopener noreferrer">Philip Kappaz II</a></li>
          <li><a className="grey-text text-lighten-3" href="https://github.com/sranney" target="_blank" rel="noopener noreferrer">Spencer Ranney</a></li>
        </ul>
        }>
          <h5 className="white-text">Final Project: Check-Your-Checkers</h5>
          <p className="grey-text text-lighten-4 ">2017 Fall Cohort of the SMU Coding Bootcamp</p>
  </Footer>
  </div>   
  </main>
  )
  }
}
export default LogIn
