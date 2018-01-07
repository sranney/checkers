var mongoose = require('mongoose');

module.exports = mongoose.models('User',{
	username: String,
	password: String,
	email: String
})