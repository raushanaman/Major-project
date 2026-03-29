const Product   = require('../../../models/Product');
const Shop      = require('../../../models/Shop');
const { cloudinary } = require('../../config/cloudinary');

const getProductsByShop = async (req, res) => {
  try {
    const products = await Product.find({ shop: req.params.shopId });
    res.json(products);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

const getFeaturedProducts = async (req, res) => {
  try {
    const categories = ['groceries', 'electronics', 'sports', 'clothing', 'cosmetics', 'furniture', 'bakery'];
    const results = await Promise.all(
      categories.map(cat =>
        Product.find({ category: cat, inStock: true, image: { $ne: null } })
          .limit(2).lean()
      )
    );
    const featured = results.flat().slice(0, 8);
    res.json(featured);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

const getMyProducts = async (req, res) => {
  try {
    const shop = await Shop.findOne({ owner: req.user.id });
    if (!shop) return res.status(404).json({ message: 'Shop not found' });
    const products = await Product.find({ shop: shop._id });
    res.json(products);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

const addProduct = async (req, res) => {
  if (req.user.role !== 'merchant')
    return res.status(403).json({ message: 'Only merchants can add products' });
  try {
    const shop = await Shop.findOne({ owner: req.user.id });
    if (!shop) return res.status(404).json({ message: 'Shop not found' });

    const imageUrl = req.file ? req.file.path : null;

    const product = await Product.create({
      ...req.body,
      shop:     shop._id,
      category: shop.category,
      image:    imageUrl,
    });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('shop');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.shop.owner.toString() !== req.user.id)
      return res.status(403).json({ message: 'Not authorized' });

    const updateData = { ...req.body };

    if (req.file) {
      // delete old image from cloudinary
      if (product.image) {
        const publicId = product.image.split('/').slice(-2).join('/').split('.')[0];
        await cloudinary.uploader.destroy(publicId).catch(() => {});
      }
      updateData.image = req.file.path;
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('shop');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.shop.owner.toString() !== req.user.id)
      return res.status(403).json({ message: 'Not authorized' });

    if (product.image) {
      const publicId = product.image.split('/').slice(-2).join('/').split('.')[0];
      await cloudinary.uploader.destroy(publicId).catch(() => {});
    }

    await product.deleteOne();
    res.json({ message: 'Product deleted' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getProductsByShop, getMyProducts, getFeaturedProducts, addProduct, updateProduct, deleteProduct };
