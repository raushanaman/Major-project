const Order = require('../../../models/Order');
const Shop  = require('../../../models/Shop');

const placeOrder = async (req, res) => {
  try {
    const { items, total, address, paymentMethod = 'razorpay', paymentId } = req.body;
    const order = await Order.create({
      user: req.user.id, items, total, address,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
      paymentId: paymentId || null,
    });
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

// User: cancel own order
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.user.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });
    if (['delivered', 'cancelled'].includes(order.status))
      return res.status(400).json({ message: 'Order cannot be cancelled' });
    order.status      = 'cancelled';
    order.cancelledBy = 'user';
    order.cancelReason = req.body.reason || '';
    await order.save();
    res.json(order);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

const getShopOrders = async (req, res) => {
  try {
    // Merchant ke saare shops dhundho
    const shops = await Shop.find({ owner: req.user.id });
    if (!shops.length) return res.status(404).json({ message: 'Shop not found' });

    const shopIds   = shops.map(s => s._id);
    const shopNames = shops.map(s => s.name.trim().toLowerCase());

    const orders = await Order.find({
      $or: [
        { 'items.shopId': { $in: shopIds } },
        ...shopNames.map(name => ({ 'items.shop': { $regex: new RegExp(name, 'i') } })),
      ]
    })
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 });

    // Har order mein sirf is merchant ke shops ke items rakhho
    const result = orders
      .map(o => {
        const shopItems = o.items.filter(i =>
          (i.shopId && shopIds.some(id => id.toString() === i.shopId.toString())) ||
          (i.shop   && shopNames.some(name => i.shop.toLowerCase().includes(name)))
        );
        if (!shopItems.length) return null;
        return { ...o.toObject(), items: shopItems };
      })
      .filter(Boolean);

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['pending', 'confirmed', 'out_for_delivery', 'delivered', 'cancelled'];
    if (!allowed.includes(status)) return res.status(400).json({ message: 'Invalid status' });

    // Merchant ke saare shops
    const shops = await Shop.find({ owner: req.user.id });
    if (!shops.length) return res.status(404).json({ message: 'Shop not found' });
    const shopIds = shops.map(s => s._id.toString());

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Kisi bhi shop ka item match karo
    const belongsToShop = order.items.some(i =>
      (i.shopId && shopIds.includes(i.shopId.toString())) ||
      (i.shop   && shops.some(s => i.shop.toLowerCase().includes(s.name.toLowerCase())))
    );
    if (!belongsToShop) return res.status(403).json({ message: 'Not authorized' });

    order.status = status;
    if (status === 'cancelled') {
      order.cancelledBy  = 'merchant';
      order.cancelReason = req.body.reason || '';
    }
    await order.save({ validateBeforeSave: false });
    res.json({ success: true, status: order.status, order });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { placeOrder, getMyOrders, getOrderById, cancelOrder, getShopOrders, updateOrderStatus };
