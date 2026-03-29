const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName:  String,
  email:     { type: String, required: true, unique: true },
  password:  { type: String, required: true },
  role:      { type: String, enum: ['user', 'merchant', 'admin'], default: 'user' },
  // merchant fields
  shopName:  String,
  phone:     String,
  address:   String,
  category:  String,
  // password reset
  resetToken:        String,
  resetTokenExpiry:  Date,
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
