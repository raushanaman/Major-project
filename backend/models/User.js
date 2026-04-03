const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName:  String,
  email:     { type: String, required: true, unique: true },
  password:  { type: String, required: true },
  role:      { type: String, enum: ['user', 'merchant', 'admin'], default: 'user' },
  shopName:  String,
  phone:     String,
  category:  String,
  addresses: [{
    label:   { type: String, default: 'Home' },
    street:  String,
    city:    String,
    state:   String,
    pincode: String,
    phone:   String,
    isDefault: { type: Boolean, default: false },
  }],
  wishlist:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  resetToken:       String,
  resetTokenExpiry: Date,
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
