import React, {Component} from "react";
import {Button, Modal, SideNavItem, SideNav, Input, Footer} from 'react-materialize';
import Board from './Board';
// import 'materialize-css';

class GamePlayPage extends Component {
    render() {
        return ( 
            <main>
                <Button type="submit" id="logOutBtn" className = "btn orange lighten-1 waves-effect waves-light z-depth-5" onClick={this.props.logOut}>Logout</Button>  

                <Board />

                <SideNav
                    trigger={ <a  id="gameChatBtn"  className="btn-floating btn-large waves-effect waves-light orange lighten-1"><i className="material-icons">chat_bubble_outline</i></a>}
                    options={{ closeOnClick: true }}>
                    <SideNavItem userView
                        user={{
                            background:'https://i.stack.imgur.com/rJzOY.jpg',
                            image: 'http://lorempixel.com/400/200/',
                            name: 'John Doe',
                            email: 'jdandturk@gmail.com'
                            }}/>
                    <SideNavItem href='#!icon' icon='person_pin'>My Profile</SideNavItem>
                    <SideNavItem divider />
                    <SideNavItem subheader>Online Users</SideNavItem>
                    <SideNavItem divider />
                    <SideNavItem href='#!icon' icon='face'>p1</SideNavItem>
                    <SideNavItem href='#!icon' icon='face'>P2
                        <Modal bottomSheet
                            header = {<h2>Your conversation with John Doe</h2>}
                            trigger={<Button className = "btn light-green waves-effect waves-light" id="chat" icon='chat_bubble_outline'></Button>}>
                            <div className="card-panel grey darken-3">
                                <span className="orange-text text-lighten-1"><p>Say bro, you down to brawl?</p></span>
                                <br/>
                                <span className="blue-text text-lighten-5"><p>Brah, you know I'm always down to brawl.</p></span>
                                <br/>
                                <span className="orange-text text-lighten-1"><p>Brawl Time!!!!!!!</p></span>
                                <br/>
                                <span className="blue-text text-lighten-5"><p>....Start the game bro.</p></span>
                                <br/>
                            </div>
                            <br/>
                            <Input for="text" label="Type your message here" />
                        </Modal>
                    </SideNavItem>
                </SideNav>
                
                <Footer id = "LogInFooter" copyrights="&copy 2017 SuperGroup"
                    className="light-green"
                    links={
                    <ul>
                        <li><a className="grey-text text-lighten-3" href="https://github.com/AaronA05" target="_blank" rel="noopener noreferrer">Aaron Arndt</a></li>
                        <li><a className="grey-text text-lighten-3" href="https://github.com/satsumao" target="_blank" rel="noopener noreferrer">Matthew Duckworth</a></li>
                        <li><a className="grey-text text-lighten-3" href="https://github.com/PhilipK2" target="_blank" rel="noopener noreferrer">Philip Kappaz II</a></li>
                        <li><a className="grey-text text-lighten-3" href="https://github.com/sranney" target="_blank" rel="noopener noreferrer">Spencer Ranney</a></li>
                    </ul>
                    }>
                        <h5 className="white-text">Final Project: Check your Checkers</h5>
                        <p className="grey-text text-lighten-4">2017 Fall Cohort of the SMU Coding Bootcamp</p>
                </Footer>
            </main>  
            );  


    }
    





}


export default GamePlayPage