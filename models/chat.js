var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

var ChatSchema = new Schema({
  sender:{
    type:String
  },
  room:{
    type:String//will be username-home and username-game
  },
  date:{
    type:Date,
    default:Date.now()
  },
  otherUser:{
  	type:String
  },
  message:{
  	type:String
  }
});

// This creates our model from the above schema, using mongoose's model method
var Chat = mongoose.model("Chat", ChatSchema);

// Export the User model
module.exports = Chat;
