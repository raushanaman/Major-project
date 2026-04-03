const Product   = require('../../../models/Product');
const Shop      = require('../../../models/Shop');
const { cloudinary } = require('../../config/cloudinary');
const csv       = require('csv-parse/sync');

const getProductsByShop = async (req, res) => {
  try {
    const products = await Product.find({ shop: req.params.shopId });
    res.json(products);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
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

    const files = req.files || [];
    if (files.length === 0)
      return res.status(400).json({ message: 'Kam se kam 1 image upload karo' });

    // slot indexes ke saath images array banao (6 slots)
    const slots      = req.body.imageSlots ? [].concat(req.body.imageSlots).map(Number) : files.map((_, i) => i);
    const images     = Array(6).fill(null);
    files.forEach((f, i) => { if (slots[i] !== undefined) images[slots[i]] = f.path; });
    const finalImages = images.filter(Boolean);
    const image       = finalImages[0] || null;

    const product = await Product.create({
      ...req.body,
      shop:     shop._id,
      category: shop.category,
      image,
      images:   finalImages,
      variants: req.body.variants ? JSON.parse(req.body.variants) : [],
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

    // existingImages: 6-slot array from frontend (empty string = slot empty/replaced)
    const existingSlots = req.body.existingImages ? [].concat(req.body.existingImages) : [];
    const newFiles      = req.files || [];
    const newSlots      = req.body.imageSlots ? [].concat(req.body.imageSlots).map(Number) : newFiles.map((_, i) => i);

    // 6-slot array banao: pehle existing URLs se fill karo
    const merged = Array(6).fill(null);
    existingSlots.forEach((url, i) => { if (url) merged[i] = url; });

    // naye files se override karo specific slots pe
    newFiles.forEach((f, i) => {
      const slot = newSlots[i];
      // agar purani image thi is slot pe toh Cloudinary se delete karo
      if (merged[slot]) {
        const publicId = merged[slot].split('/').slice(-2).join('/').split('.')[0];
        cloudinary.uploader.destroy(publicId).catch(() => {});
      }
      merged[slot] = f.path;
    });

    if (req.body.variants !== undefined)
      updateData.variants = JSON.parse(req.body.variants);

    const finalImages = merged.filter(Boolean);
    if (finalImages.length === 0)
      return res.status(400).json({ message: 'Kam se kam 1 image honi chahiye' });

    updateData.images = finalImages;
    updateData.image  = finalImages[0];

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

const bulkUploadCSV = async (req, res) => {
  if (req.user.role !== 'merchant')
    return res.status(403).json({ message: 'Only merchants can upload products' });
  try {
    const shop = await Shop.findOne({ owner: req.user.id });
    if (!shop) return res.status(404).json({ message: 'Shop not found' });
    if (!req.file) return res.status(400).json({ message: 'CSV file required' });

    const records = csv.parse(req.file.buffer, { columns: true, skip_empty_lines: true, trim: true });
    if (!records.length) return res.status(400).json({ message: 'CSV is empty' });

    const created = [];
    for (const row of records) {
      if (!row.name || !row.price) continue;
      created.push(await Product.create({
        shop:     shop._id,
        category: shop.category,
        name:     row.name,
        price:    Number(row.price),
        desc:     row.desc || '',
        tag:      row.tag  || '',
        emoji:    row.emoji || '',
        inStock:  row.inStock !== 'false',
        image:    row.image || null,
        images:   row.image ? [row.image] : [],
      }));
    }
    res.status(201).json({ message: `${created.length} products added`, products: created });
  } catch (err) {
    res.status(500).json({ message: 'CSV parse error', error: err.message });
  }
};

const searchProducts = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q?.trim()) return res.json([]);

    const regex = new RegExp(q.trim(), 'i');
    const products = await Product.find({
      inStock: true,
      $or: [
        { name:     regex },
        { desc:     regex },
        { category: regex },
        { tag:      regex },
      ],
    }).populate('shop', 'name city').limit(30).lean();

    // Similar products — same category ke baaki products
    const categories = [...new Set(products.map(p => p.category))];
    const similar = await Product.find({
      inStock:  true,
      category: { $in: categories },
      _id:      { $nin: products.map(p => p._id) },
    }).populate('shop', 'name city').limit(12).lean();

    res.json({ results: products, similar });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getProductsByShop, getMyProducts, getFeaturedProducts, getProductById, searchProducts, addProduct, updateProduct, deleteProduct, bulkUploadCSV };
