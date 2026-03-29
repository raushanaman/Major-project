const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  shop:     { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  name:     { type: String, required: true },
  price:    { type: Number, required: true },
  desc:     String,
  category: String,
  tag:      String,
  emoji:    String,
  image:    String,
  inStock:  { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
