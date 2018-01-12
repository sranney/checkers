var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

var UsersSchema = new Schema({
  uid:{
    type:String
  },
  email:{
    type:String
  },
  displayName:{
  	type:String
  },
  username:{
    type:String
  },  
  photoURL:{
    type:String
  },
  online:{
    type:Boolean,
    default:true
  },
  socket:{
    type:String,
    default:""
  },
  wins:{
    type:Number,
    default:0
  },
  losses:{
    type:Number,
    default:0
  }
});

// This creates our model from the above schema, using mongoose's model method
var Users = mongoose.model("User", UsersSchema);

// Export the User model
module.exports = Users;
