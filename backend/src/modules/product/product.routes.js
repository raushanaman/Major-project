const express = require('express');
const { getProductsByShop, getMyProducts, getFeaturedProducts, addProduct, updateProduct, deleteProduct } = require('./product.controller');
const authMiddleware = require('../../../middleware/auth');
const { upload } = require('../../config/cloudinary');
const router = express.Router();

router.get('/featured',      getFeaturedProducts);
router.get('/shop/:shopId',  getProductsByShop);
router.get('/my',            authMiddleware, getMyProducts);
router.post('/',             authMiddleware, upload.single('image'), addProduct);
router.put('/:id',           authMiddleware, upload.single('image'), updateProduct);
router.delete('/:id',        authMiddleware, deleteProduct);

module.exports = router;
