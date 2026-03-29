const express = require('express');
const Order = require('../models/Order');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Place order
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { items, total, address } = req.body;
    const order = await Order.create({ user: req.user.id, items, total, address });
    res.status(201).json(order);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get my orders
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single order
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.user.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });
    res.json(order);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
