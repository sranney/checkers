//react
import React from "react";

//materialize components
import {Button, Modal, SideNavItem, SideNav, Card, CardTitle, Input, Footer, Toast} from 'react-materialize';

export default class NoVacancy extends React.Component {
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
            <Card className="red lighten-5">
                <h2 className='card-content red-text'>No Vacancy</h2>
                <div className='card-content red-text'><p>Room already has an opponent! Redirecting to home page in {this.state.redirectTime} seconds.</p></div>
            </Card>
        )
    }
}