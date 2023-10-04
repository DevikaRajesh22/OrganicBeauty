const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const { Schema, ObjectId } = mongoose;

const AdminSchema = new Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
});

module.exports=mongoose.model('Admin', AdminSchema);