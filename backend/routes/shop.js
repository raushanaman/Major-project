const express = require('express');
const Shop = require('../models/Shop');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Get all shops
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};
    const shops = await Shop.find(filter).populate('owner', 'firstName lastName email');
    res.json(shops);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single shop
router.get('/:id', async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id).populate('owner', 'firstName lastName');
    if (!shop) return res.status(404).json({ message: 'Shop not found' });
    res.json(shop);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create shop (merchant only)
router.post('/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'merchant') return res.status(403).json({ message: 'Only merchants can create shops' });
  try {
    const shop = await Shop.create({ ...req.body, owner: req.user.id });
    res.status(201).json(shop);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update shop (owner only)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) return res.status(404).json({ message: 'Shop not found' });
    if (shop.owner.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });
    const updated = await Shop.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get my shop (merchant)
router.get('/my/shop', authMiddleware, async (req, res) => {
  try {
    const shop = await Shop.findOne({ owner: req.user.id });
    if (!shop) return res.status(404).json({ message: 'No shop found' });
    res.json(shop);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
