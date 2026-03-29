const express = require('express');
const { getAllShops, getShopById, createShop, updateShop, getMyShop } = require('./shop.controller');
const authMiddleware = require('../../../middleware/auth');
const router = express.Router();

router.get('/',          getAllShops);
router.get('/my/shop',   authMiddleware, getMyShop); // must be before /:id
router.get('/:id',       getShopById);
router.post('/',         authMiddleware, createShop);
router.put('/:id',       authMiddleware, updateShop);

module.exports = router;
