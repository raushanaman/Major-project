const express = require('express');
const { getStats, getAllShops, deleteShop, toggleShopStatus } = require('./admin.controller');
const authMiddleware = require('../../../middleware/auth');
const router = express.Router();

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin')
    return res.status(403).json({ message: 'Admin access only' });
  next();
};

router.use(authMiddleware, adminOnly);

router.get('/stats',              getStats);
router.get('/shops',              getAllShops);
router.delete('/shops/:id',       deleteShop);
router.patch('/shops/:id/toggle', toggleShopStatus);

module.exports = router;
