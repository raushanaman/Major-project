const express = require('express');
const { getShopReviews, addReview, deleteReview } = require('./review.controller');
const authMiddleware = require('../../../middleware/auth');
const router = express.Router();

router.get('/:shopId',     getShopReviews);
router.post('/:shopId',    authMiddleware, addReview);
router.delete('/:id',      authMiddleware, deleteReview);

module.exports = router;
