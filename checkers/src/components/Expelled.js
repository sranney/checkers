//react
import React from "react";

//materialize components
import {Button, Modal, SideNavItem, SideNav, Card, CardTitle, Input, Footer, Toast} from 'react-materialize';

//simple component that will display when the user has been expelled from the room
export default class Expelled extends React.Component {
    constructor(){
        super();
        this.state = {
            redirectTime:5
        }
    }
    //sets up a timer that will display countdown from 5 seconds
    //allows user to understand why they aren't in the room anymore
    componentDidMount(){
        let IntervalID = setInterval(()=>{
            if(this.state.redirectTime <= 0){ 

                this.props.history.push("/home");
                clearInterval(IntervalID);
                this.state.redirectTime=5;
            } else {
                let {redirectTime} = this.state;
                redirectTime--;
                this.setState({redirectTime});
            }
        },1000)
    }
    render(){
        return(
            <div className='Container col-md-12 text-center'>
            <Card className="orange lighten-1">
                <h2 className='card-content grey-text text-lighten-3'>You Have Been Expelled!</h2>
                <div className='card-content grey-text text-lighten-3'><p>Redirecting to home page in {this.state.redirectTime} seconds.</p></div>
            </Card>
            </div>
        )
    }
}