const crypto   = require('crypto');
const razorpay = require('../../config/razorpay');
const Order    = require('../../../models/Order');

const createOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    const order = await razorpay.orders.create({
      amount:   Math.round(amount * 100),
      currency: 'INR',
      receipt:  `receipt_${Date.now()}`,
    });
    res.json({ order });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create order', error: err.message });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, items, total, address, paymentMethod } = req.body;

    const body     = razorpay_order_id + '|' + razorpay_payment_id;
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expected !== razorpay_signature)
      return res.status(400).json({ success: false, message: 'Invalid signature' });

    const order = await Order.create({
      user:          req.user.id,
      items:         (items || []).map(i => ({
        name:   i.name,
        price:  i.price,
        qty:    i.qty,
        emoji:  i.emoji,
        shop:   i.shop   || '',
        shopId: i.shopId || null,
        image:  i.image  || null,
      })),
      total:         total || 0,
      address:       address || '',
      status:        'confirmed',
      paymentMethod: paymentMethod || 'razorpay',
      paymentStatus: 'paid',
      paymentId:     razorpay_payment_id,
    });

    res.json({ success: true, paymentId: razorpay_payment_id, orderId: order._id });
  } catch (err) {
    res.status(500).json({ message: 'Verification failed', error: err.message });
  }
};

module.exports = { createOrder, verifyPayment };
