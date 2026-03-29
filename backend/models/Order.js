const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items:  [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name:    String,
    price:   Number,
    qty:     Number,
    emoji:   String,
    shop:    String,
    shopId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' },
    image:   String,
  }],
  total:   { type: Number, required: true },
  status:    { type: String, enum: ['pending', 'confirmed', 'delivered', 'cancelled'], default: 'pending' },
  address:   String,
  paymentId: String,
  shopName:  String,
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
