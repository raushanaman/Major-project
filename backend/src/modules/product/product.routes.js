const express = require('express');
const { getProductsByShop, getMyProducts, getFeaturedProducts, getProductById, searchProducts, addProduct, updateProduct, deleteProduct, bulkUploadCSV } = require('./product.controller');
const authMiddleware = require('../../../middleware/auth');
const { upload, uploadMultiple } = require('../../config/cloudinary');
const multer = require('multer');
const router = express.Router();

const csvUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024 } }).single('csv');

router.get('/featured',      getFeaturedProducts);
router.get('/search',        searchProducts);
router.get('/shop/:shopId',  getProductsByShop);
router.get('/my',            authMiddleware, getMyProducts);
router.post('/bulk-csv',     authMiddleware, csvUpload, bulkUploadCSV);
router.post('/',             authMiddleware, uploadMultiple, addProduct);
router.get('/:id',           getProductById);
router.put('/:id',           authMiddleware, uploadMultiple, updateProduct);
router.delete('/:id',        authMiddleware, deleteProduct);

module.exports = router;
