//firebase configuration
import firebase from "firebase";
var config = {
    apiKey: "AIzaSyDfXtc_9pWFAQJZH3z7jqqCx9Jz-2gDDDE",
    authDomain: "checkers-ce8cc.firebaseapp.com",
    databaseURL: "https://checkers-ce8cc.firebaseio.com",
    projectId: "checkers-ce8cc",
    storageBucket: "checkers-ce8cc.appspot.com",
    messagingSenderId: "810547108"
};

firebase.initializeApp(config);
//setting up helpers for google, twitter and facebook auth
export const googleProvider = new firebase.auth.GoogleAuthProvider();
export const twitterProvider = new firebase.auth.TwitterAuthProvider();
export const facebookProvider = new firebase.auth.FacebookAuthProvider();

//exporting auth object with everything configured above to be used in App.js
export const auth = firebase.auth();