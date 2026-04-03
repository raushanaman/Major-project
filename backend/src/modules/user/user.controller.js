const User = require('../../../models/User');

// Get all addresses
const getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('addresses');
    res.json(user.addresses || []);
  } catch { res.status(500).json({ message: 'Server error' }); }
};

// Add address
const addAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (req.body.isDefault) user.addresses.forEach(a => a.isDefault = false);
    user.addresses.push(req.body);
    await user.save();
    res.status(201).json(user.addresses);
  } catch { res.status(500).json({ message: 'Server error' }); }
};

// Update address
const updateAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const addr = user.addresses.id(req.params.addrId);
    if (!addr) return res.status(404).json({ message: 'Address not found' });
    if (req.body.isDefault) user.addresses.forEach(a => a.isDefault = false);
    Object.assign(addr, req.body);
    await user.save();
    res.json(user.addresses);
  } catch { res.status(500).json({ message: 'Server error' }); }
};

// Delete address
const deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.addresses = user.addresses.filter(a => a._id.toString() !== req.params.addrId);
    await user.save();
    res.json(user.addresses);
  } catch { res.status(500).json({ message: 'Server error' }); }
};

// Toggle wishlist
const toggleWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const pid  = req.params.productId;
    const idx  = user.wishlist.indexOf(pid);
    if (idx === -1) user.wishlist.push(pid);
    else user.wishlist.splice(idx, 1);
    await user.save();
    res.json({ wishlist: user.wishlist });
  } catch { res.status(500).json({ message: 'Server error' }); }
};

// Get wishlist
const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('wishlist');
    res.json(user.wishlist || []);
  } catch { res.status(500).json({ message: 'Server error' }); }
};

module.exports = { getAddresses, addAddress, updateAddress, deleteAddress, toggleWishlist, getWishlist };
