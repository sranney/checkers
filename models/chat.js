var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

var ChatSchema = new Schema({
  room:{
    type:String
  },
  date:{
    type:Date,
    default:Date.now()
  },
  user_email:{
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
