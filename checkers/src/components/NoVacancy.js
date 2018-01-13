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
            <div className='Container col-md-12 text-center' id="returnHomeDiv">
                <Card className="light-green">
                    <h2 className='card-content grey-text text-lighten-3'>No Vacancy</h2>
                    <div className='card-content grey-text text-lighten-3'><p>Room already has an opponent! Redirecting to home page in {this.state.redirectTime} seconds.</p></div>
                </Card>
            </div>
        )
    }
}