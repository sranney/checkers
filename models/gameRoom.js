var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

var grSchema = new Schema({
  room:{
    type:String
  },
  opponent:{
    type:String,
    default:""
  }
});

// This creates our model from the above schema, using mongoose's model method
var gameRoom = mongoose.model("gameRoom", grSchema);

// Export the gameRoom model
module.exports = gameRoom;