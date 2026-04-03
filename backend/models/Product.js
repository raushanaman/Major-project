const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  label: { type: String, required: true }, // e.g. 'Size', 'Color', 'Weight'
  options: [{
    value: { type: String, required: true }, // e.g. 'S', 'Red', '1kg'
    price: { type: Number },                 // optional price override
    inStock: { type: Boolean, default: true },
  }],
}, { _id: false });

const productSchema = new mongoose.Schema({
  shop:     { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  name:     { type: String, required: true },
  price:    { type: Number, required: true },
  desc:     String,
  category: String,
  tag:      String,
  emoji:    String,
  image:    String,
  images:   [String],
  inStock:  { type: Boolean, default: true },
  variants: [variantSchema],
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
