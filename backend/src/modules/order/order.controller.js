const Order = require('../../../models/Order');
const Shop  = require('../../../models/Shop');

const placeOrder = async (req, res) => {
  try {
    const { items, total, address } = req.body;
    const order = await Order.create({ user: req.user.id, items, total, address });
    res.status(201).json(order);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.user.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });
    res.json(order);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

// Merchant: get all orders for their shop
const getShopOrders = async (req, res) => {
  try {
    const shop = await Shop.findOne({ owner: req.user.id });
    if (!shop) return res.status(404).json({ message: 'Shop not found' });

    // match by shopId OR by shop name (fallback for old orders)
    const orders = await Order.find({
      $or: [
        { 'items.shopId': shop._id },
        { 'items.shop': { $regex: new RegExp(shop.name, 'i') } },
      ]
    })
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 });

    const filtered = orders.map(o => ({
      ...o.toObject(),
      items: o.items.filter(i =>
        i.shopId?.toString() === shop._id.toString() ||
        i.shop?.toLowerCase().includes(shop.name.toLowerCase())
      ),
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Merchant: update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['pending', 'confirmed', 'delivered', 'cancelled'];
    if (!allowed.includes(status)) return res.status(400).json({ message: 'Invalid status' });

    const shop = await Shop.findOne({ owner: req.user.id });
    if (!shop) return res.status(404).json({ message: 'Shop not found' });

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const belongsToShop = order.items.some(i => i.shopId?.toString() === shop._id.toString());
    if (!belongsToShop) return res.status(403).json({ message: 'Not authorized' });

    order.status = status;
    await order.save();
    res.json(order);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { placeOrder, getMyOrders, getOrderById, getShopOrders, updateOrderStatus };
