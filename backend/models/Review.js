const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  shop:    { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  order:   { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  rating:  { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true, trim: true },
}, { timestamps: true });

reviewSchema.index({ shop: 1, user: 1 }, { unique: true }); // one review per user per shop

module.exports = mongoose.model('Review', reviewSchema);
