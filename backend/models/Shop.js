const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
  owner:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:     { type: String, required: true },
  category: { type: String, required: true },
  phone:    String,
  address:  String,
  city:     String,
  image:    String,
  status:   { type: String, enum: ['open', 'closed'], default: 'open' },
  rating:   { type: Number, default: 0 },
  reviews:  { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Shop', shopSchema);
