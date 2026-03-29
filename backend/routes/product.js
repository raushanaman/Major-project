const express = require('express');
const Product = require('../models/Product');
const Shop = require('../models/Shop');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Get products by shop
router.get('/shop/:shopId', async (req, res) => {
  try {
    const products = await Product.find({ shop: req.params.shopId });
    res.json(products);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add product (merchant only)
router.post('/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'merchant') return res.status(403).json({ message: 'Only merchants can add products' });
  try {
    const shop = await Shop.findOne({ owner: req.user.id });
    if (!shop) return res.status(404).json({ message: 'Shop not found' });
    const product = await Product.create({ ...req.body, shop: shop._id, category: shop.category });
    res.status(201).json(product);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update product
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('shop');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.shop.owner.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete product
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('shop');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.shop.owner.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });
    await product.deleteOne();
    res.json({ message: 'Product deleted' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
