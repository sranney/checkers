import React from 'react';
import ReactDOM from 'react-dom';
// import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import {HashRouter} from "react-router-dom";

//hashrouter is important here - if user refreshes page with BrowserRouter, app breaks
//if user tries to connect to a particular page in the app from a link when they are not currently on the app, without HashRouter, the app will break
//together with the express endpoint catch-all "*", HashRouter allows for keeping the ui in sync with a multiple route url
//this was necessary for the gameroom urls which are of the form "/gameroom/<username>"
//The <HashRouter>, on the other hand, uses the hash portion of the URL (window.location.hash) to remember things.
ReactDOM.render(
    <HashRouter>
        < App / > 
    </HashRouter>
        , document.getElementById('root'));
        registerServiceWorker();