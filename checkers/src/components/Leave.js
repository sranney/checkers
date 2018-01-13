//react
import React from "react";

//materialize components
import {Button, Modal, SideNavItem, SideNav, Card, CardTitle, Input, Footer, Toast} from 'react-materialize';

export default class Leave extends React.Component {
    constructor(){
        super();
        this.state = {
            redirectTime:5
        }
    }
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
            <div className='Container col-md-12 text-center' id="returnHomeDiv">
            <Card className="grey-lighten-3">
                <h2 className='card-content orange-text lighten-1'>Returning to Home</h2>
                <div className='card-content orange-text lighten-1'><p>Redirecting to home page in {this.state.redirectTime} seconds.</p></div>
            </Card>
            </div>
        )
    }
}