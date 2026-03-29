const Review = require('../../../models/Review');
const Shop   = require('../../../models/Shop');
const Order  = require('../../../models/Order');

const getShopReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ shop: req.params.shopId })
      .populate('user', 'firstName lastName')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const { shopId } = req.params;

    const existing = await Review.findOne({ shop: shopId, user: req.user.id });
    if (existing) return res.status(400).json({ message: 'You have already reviewed this shop' });

    const review = await Review.create({
      shop: shopId, user: req.user.id, rating, comment,
    });

    // recalculate shop rating
    const all = await Review.find({ shop: shopId });
    const avg = all.reduce((s, r) => s + r.rating, 0) / all.length;
    await Shop.findByIdAndUpdate(shopId, {
      rating:  Math.round(avg * 10) / 10,
      reviews: all.length,
    });

    const populated = await review.populate('user', 'firstName lastName');
    res.status(201).json(populated);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'You have already reviewed this shop' });
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    if (review.user.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

    const shopId = review.shop;
    await review.deleteOne();

    const all = await Review.find({ shop: shopId });
    const avg = all.length ? all.reduce((s, r) => s + r.rating, 0) / all.length : 0;
    await Shop.findByIdAndUpdate(shopId, {
      rating:  Math.round(avg * 10) / 10,
      reviews: all.length,
    });

    res.json({ message: 'Review deleted' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getShopReviews, addReview, deleteReview };
