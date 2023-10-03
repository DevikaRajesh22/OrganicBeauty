const mongoose = require('mongoose');

const UsersSchema = new mongoose.Schema({
  name: { type: String, required: true},
  email: { type: String, required: true },
  number: { type: String, required: true },
  spassword: {type: String, required: true},
  isBlocked: {
    type: Boolean,
    default: false, // Initially, users are not blocked
  },
  isVerified:{type:Boolean, default:false},
});



module.exports=mongoose.model('User', UsersSchema);