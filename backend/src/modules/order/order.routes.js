const express = require('express');
const { placeOrder, getMyOrders, getOrderById, cancelOrder, getShopOrders, updateOrderStatus } = require('./order.controller');
const authMiddleware = require('../../../middleware/auth');
const router = express.Router();

router.post('/',              authMiddleware, placeOrder);
router.get('/my',             authMiddleware, getMyOrders);
router.get('/shop',           authMiddleware, getShopOrders);
router.get('/:id',            authMiddleware, getOrderById);
router.patch('/:id/status',   authMiddleware, updateOrderStatus);
router.patch('/:id/cancel',   authMiddleware, cancelOrder);

module.exports = router;
