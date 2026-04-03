const express = require('express');
const { getAddresses, addAddress, updateAddress, deleteAddress, toggleWishlist, getWishlist } = require('./user.controller');
const authMiddleware = require('../../../middleware/auth');
const router = express.Router();

router.get('/addresses',                    authMiddleware, getAddresses);
router.post('/addresses',                   authMiddleware, addAddress);
router.put('/addresses/:addrId',            authMiddleware, updateAddress);
router.delete('/addresses/:addrId',         authMiddleware, deleteAddress);
router.get('/wishlist',                     authMiddleware, getWishlist);
router.patch('/wishlist/:productId',        authMiddleware, toggleWishlist);

module.exports = router;
