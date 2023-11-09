const mongoose = require('mongoose');

const UsersSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  number: {
    type: String,
    required: true
  },
  spassword: {
    type: String,
    required: true
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  wallet :{
    type : Number,
    default : 0,
  },
  walletHistory :[{
    date :{
      type : Date
    },
    amount :{
      type : Number
    },
    status :{
      type : String
    }
  }],
  referralCode: {
    type: String,
    unique: true
  },
});



module.exports = mongoose.model('User', UsersSchema);