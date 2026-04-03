const Review  = require('../../../models/Review');
const Shop    = require('../../../models/Shop');
const { cloudinary } = require('../../config/cloudinary');
const multer  = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const reviewStorage = new CloudinaryStorage({
  cloudinary,
  params: { folder: 'mandi360/reviews', allowed_formats: ['jpg','jpeg','png','webp'],
    transformation: [{ width: 600, height: 600, crop: 'limit', quality: 'auto' }] },
});
const uploadReviewImages = multer({ storage: reviewStorage }).array('images', 3);

const getShopReviews = async (req, res) => {
  try {
    const filter = { shop: req.params.shopId, approved: true };
    const reviews = await Review.find(filter)
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

    const images = req.files?.map(f => f.path) || [];
    const review = await Review.create({
      shop: shopId, user: req.user.id, rating, comment, images,
      product: req.body.productId || null,
    });

    const all = await Review.find({ shop: shopId });
    const avg = all.reduce((s, r) => s + r.rating, 0) / all.length;
    await Shop.findByIdAndUpdate(shopId, { rating: Math.round(avg * 10) / 10, reviews: all.length });

    const populated = await review.populate('user', 'firstName lastName');
    res.status(201).json(populated);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Already reviewed' });
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    if (review.user.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });
    const shopId = review.shop;
    // delete images from cloudinary
    for (const img of review.images || []) {
      const pid = img.split('/').slice(-2).join('/').split('.')[0];
      await cloudinary.uploader.destroy(pid).catch(() => {});
    }
    await review.deleteOne();
    const all = await Review.find({ shop: shopId });
    const avg = all.length ? all.reduce((s, r) => s + r.rating, 0) / all.length : 0;
    await Shop.findByIdAndUpdate(shopId, { rating: Math.round(avg * 10) / 10, reviews: all.length });
    res.json({ message: 'Review deleted' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

// Toggle helpful vote
const toggleHelpful = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Not found' });
    const uid = req.user.id;
    const idx = review.helpful.indexOf(uid);
    if (idx === -1) review.helpful.push(uid);
    else review.helpful.splice(idx, 1);
    await review.save();
    res.json({ helpful: review.helpful.length });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

// Report review (moderation)
const reportReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Not found' });
    if (!review.reported.includes(req.user.id)) review.reported.push(req.user.id);
    if (review.reported.length >= 3) review.approved = false; // auto-hide after 3 reports
    await review.save();
    res.json({ message: 'Reported' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getShopReviews, addReview, deleteReview, toggleHelpful, reportReview, uploadReviewImages };
