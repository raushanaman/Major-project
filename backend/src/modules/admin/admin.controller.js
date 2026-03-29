const Shop  = require('../../../models/Shop');
const Order = require('../../../models/Order');
const User  = require('../../../models/User');

const getStats = async (req, res) => {
  try {
    const [totalShops, totalOrders, totalUsers] = await Promise.all([
      Shop.countDocuments(),
      Order.countDocuments(),
      User.countDocuments(),
    ]);

    const topShops = await Order.aggregate([
      { $unwind: '$items' },
      { $group: {
          _id: '$items.shop',
          totalPurchases: { $sum: '$items.qty' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.qty'] } },
      }},
      { $sort: { totalPurchases: -1 } },
      { $limit: 10 },
    ]);

    res.json({ totalShops, totalOrders, totalUsers, topShops });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getAllShops = async (req, res) => {
  try {
    const shops = await Shop.find().populate('owner', 'firstName lastName email').sort({ createdAt: -1 });
    res.json(shops);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteShop = async (req, res) => {
  try {
    const shop = await Shop.findByIdAndDelete(req.params.id);
    if (!shop) return res.status(404).json({ message: 'Shop not found' });
    res.json({ message: 'Shop deleted' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

const toggleShopStatus = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) return res.status(404).json({ message: 'Shop not found' });
    shop.status = shop.status === 'open' ? 'closed' : 'open';
    await shop.save();
    res.json(shop);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getStats, getAllShops, deleteShop, toggleShopStatus };
