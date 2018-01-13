import React from 'react';
import { Chart } from 'react-google-charts';
import axios from "axios";
import {Button} from 'react-materialize';

export default class Rankings extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        options: {
            title: 'Rankings',
            hAxis: { title: 'Wins'},
            vAxis: { title: 'Player'}
        },
        data: []
        };
    }  
    componentDidMount(){
        axios.get("/getRankings").then(result=>{
            this.setState({data:result.data});
            // this.setState({
            //     data : result.data
            // })
        })
    }
    home = () => {
        this.props.history.push("/home");
    }
    render() {
        return (
        <main>
            <Button  
                id="homeBtn" 
                className = "btn orange lighten-1 waves-effect waves-light z-depth-2" 
                onClick={this.home}>
                Home
            </Button> 
            <Chart
                chartType="BarChart"
                data={this.state.data}
                options={this.state.options}
                graph_id="BarChart"
                width="100%"
                height="400px"
                legend_toggle
            />
        </main>
        );
    }
}
