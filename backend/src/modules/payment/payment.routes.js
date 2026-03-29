const express = require('express');
const { createOrder, verifyPayment } = require('./payment.controller');
const authMiddleware = require('../../../middleware/auth');
const router = express.Router();

router.post('/create-order', authMiddleware, createOrder);
router.post('/verify',       authMiddleware, verifyPayment);

module.exports = router;
