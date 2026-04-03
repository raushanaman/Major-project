const express = require('express');
const { getShopReviews, addReview, deleteReview, toggleHelpful, reportReview, uploadReviewImages } = require('./review.controller');
const authMiddleware = require('../../../middleware/auth');
const router = express.Router();

router.get('/:shopId',          getShopReviews);
router.post('/:shopId',         authMiddleware, uploadReviewImages, addReview);
router.delete('/:id',           authMiddleware, deleteReview);
router.patch('/:id/helpful',    authMiddleware, toggleHelpful);
router.patch('/:id/report',     authMiddleware, reportReview);

module.exports = router;
