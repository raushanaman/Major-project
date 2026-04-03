const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items:     [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name:    String,
    price:   Number,
    qty:     Number,
    emoji:   String,
    shop:    String,
    shopId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' },
    image:   String,
  }],
  total:       { type: Number, required: true },
  status:      { type: String, enum: ['pending', 'confirmed', 'out_for_delivery', 'delivered', 'cancelled'], default: 'pending' },
  paymentMethod: { type: String, enum: ['razorpay', 'cod'], default: 'razorpay' },
  paymentStatus: { type: String, enum: ['paid', 'pending', 'failed'], default: 'pending' },
  address:     { street: String, city: String, state: String, pincode: String, phone: String },
  paymentId:   String,
  shopName:    String,
  cancelledBy: { type: String, enum: ['user', 'merchant'] },
  cancelReason: String,
  invoice:     String,
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
