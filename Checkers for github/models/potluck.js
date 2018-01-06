var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

var PotluckSchema = new Schema({
  title:{
    type:String
  },
  user:{
    type:String
  } 
});

// This creates our model from the above schema, using mongoose's model method
var Potluck = mongoose.model("Potluck", PotluckSchema);

// Export the User model
module.exports = Potluck;
