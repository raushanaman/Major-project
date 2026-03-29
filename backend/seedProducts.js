require('dotenv').config();
const mongoose  = require('mongoose');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

require('./models/User');
const Shop    = require('./models/Shop');
const Product = require('./models/Product');

const PRODUCTS_BY_CATEGORY = {
  groceries: [
    { name: 'Premium Basmati Rice 5kg',     price: 499,  tag: 'Best Seller', desc: 'Aged 2 years, long grain aromatic rice',         imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80' },
    { name: 'Cold Pressed Coconut Oil 1L',  price: 349,  tag: 'Organic',     desc: 'Virgin cold pressed, no chemicals',              imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&q=80' },
    { name: 'Farm Fresh Eggs (12 pcs)',      price: 89,   tag: 'Fresh',       desc: 'Free range, farm fresh daily delivery',          imageUrl: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=600&q=80' },
    { name: 'Whole Wheat Atta 10kg',         price: 389,  tag: 'Popular',     desc: 'Stone ground, 100% whole wheat',                 imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&q=80' },
    { name: 'Toor Dal 2kg',                  price: 219,  tag: 'Trending',    desc: 'Premium quality, clean sorted',                  imageUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&q=80' },
    { name: 'Mixed Spices Combo (8 pcs)',    price: 299,  tag: 'New',         desc: 'Authentic Indian spices, freshly ground',        imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&q=80' },
  ],
  electronics: [
    { name: 'Wireless Earbuds Pro',          price: 1299, tag: 'Best Seller', desc: '30hr battery, ANC, IPX5 waterproof',             imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80' },
    { name: 'USB-C 65W GaN Charger',         price: 599,  tag: 'Popular',     desc: 'Fast charge, foldable plug, universal',          imageUrl: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600&q=80' },
    { name: 'Bluetooth Speaker 360°',        price: 2499, tag: 'Trending',    desc: 'Waterproof, 20hr playtime, deep bass',           imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=80' },
    { name: 'Mechanical Keyboard TKL',       price: 3499, tag: 'New',         desc: 'RGB backlit, blue switches, compact',            imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80' },
    { name: 'Webcam 1080p HD',               price: 1899, tag: 'Popular',     desc: 'Auto focus, built-in mic, plug & play',          imageUrl: 'https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=600&q=80' },
    { name: 'Phone Stand Adjustable',        price: 299,  tag: 'Trending',    desc: 'Foldable, 360° rotation, all phones',            imageUrl: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600&q=80' },
  ],
  sports: [
    { name: 'Yoga Mat 6mm Anti-Slip',        price: 799,  tag: 'Best Seller', desc: 'Eco-friendly TPE, carrying strap included',      imageUrl: 'https://images.unsplash.com/photo-1601925228008-f5e4c5e5e5e5?w=600&q=80' },
    { name: 'Resistance Bands Set (5pcs)',   price: 499,  tag: 'Popular',     desc: '5 resistance levels, latex free',                imageUrl: 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=600&q=80' },
    { name: 'Insulated Water Bottle 1L',     price: 349,  tag: 'Trending',    desc: 'BPA free, keeps cold 24hr, hot 12hr',            imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&q=80' },
    { name: 'Adjustable Dumbbell 10kg',      price: 1299, tag: 'New',         desc: 'Cast iron, rubber grip, pair',                   imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80' },
    { name: 'Running Shoes Men',             price: 2499, tag: 'Best Seller', desc: 'Lightweight, breathable mesh, cushioned sole',   imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80' },
    { name: 'Jump Rope Speed',               price: 249,  tag: 'Popular',     desc: 'Ball bearing, adjustable length, steel cable',   imageUrl: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=600&q=80' },
  ],
  clothing: [
    { name: 'Cotton Kurta Set',              price: 899,  tag: 'Best Seller', desc: '100% pure cotton, M-XXL, 5 colors',             imageUrl: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&q=80' },
    { name: 'Slim Fit Denim Jeans',          price: 1499, tag: 'Trending',    desc: 'Stretch denim, 28-38 waist, dark wash',          imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80' },
    { name: 'Linen Casual Shirt',            price: 799,  tag: 'Popular',     desc: 'Breathable linen, half sleeves, 6 colors',       imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80' },
    { name: 'Ethnic Embroidered Dupatta',    price: 449,  tag: 'New',         desc: 'Hand embroidered, chiffon, 8 colors',            imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80' },
    { name: 'Formal Blazer Men',             price: 2999, tag: 'Best Seller', desc: 'Slim fit, polyester blend, S-XXL',               imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=80' },
    { name: 'Printed Saree',                 price: 1299, tag: 'Trending',    desc: 'Digital print, georgette fabric, with blouse',   imageUrl: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&q=80' },
  ],
  cosmetics: [
    { name: 'Vitamin C Serum 30ml',          price: 549,  tag: 'Best Seller', desc: '20% concentration, brightening, anti-aging',     imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80' },
    { name: 'Matte Lipstick Set (6 shades)', price: 599,  tag: 'Popular',     desc: '12hr stay, transfer proof, moisturizing',        imageUrl: 'https://images.unsplash.com/photo-1586495777744-4e6232bf2f9a?w=600&q=80' },
    { name: 'SPF 50 Sunscreen 100ml',        price: 399,  tag: 'New',         desc: 'PA++++, non-greasy, water resistant',            imageUrl: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&q=80' },
    { name: 'Salicylic Acid Face Wash',      price: 249,  tag: 'Trending',    desc: '2% SA, deep cleanse, acne control, 100ml',       imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=80' },
    { name: 'Hyaluronic Acid Moisturizer',   price: 699,  tag: 'Best Seller', desc: 'Deep hydration, all skin types, 50ml',           imageUrl: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab12?w=600&q=80' },
    { name: 'Kajal & Eyeliner Combo',        price: 199,  tag: 'Popular',     desc: 'Waterproof, smudge proof, 24hr stay',            imageUrl: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&q=80' },
  ],
  furniture: [
    { name: 'Solid Wood Study Table',        price: 4999, tag: 'Popular',     desc: 'Sheesham wood, 4ft x 2ft, 2 drawers',           imageUrl: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600&q=80' },
    { name: '3-Tier Bookshelf',              price: 2799, tag: 'Best Seller', desc: 'MDF board, easy assembly, 3 colors',             imageUrl: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=600&q=80' },
    { name: 'Ergonomic Office Chair',        price: 6499, tag: 'New',         desc: 'Lumbar support, adjustable height, mesh back',   imageUrl: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=600&q=80' },
    { name: 'LED Bedside Lamp',              price: 899,  tag: 'Trending',    desc: '3 brightness levels, USB charging port',         imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80' },
    { name: 'Sofa 3-Seater Fabric',         price: 18999,tag: 'Popular',     desc: 'Premium fabric, solid wood legs, washable cover', imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80' },
    { name: 'Wall Mounted Shelf Set',        price: 1299, tag: 'Best Seller', desc: 'Set of 3, floating design, holds 15kg each',     imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80' },
  ],
  bakery: [
    { name: 'Sourdough Bread Loaf',          price: 180,  tag: 'Fresh',       desc: 'Baked fresh every morning, 400g',                imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80' },
    { name: 'Chocolate Croissant (2 pcs)',   price: 120,  tag: 'Best Seller', desc: 'Buttery, flaky layers, Belgian chocolate',       imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&q=80' },
    { name: 'Red Velvet Cake (500g)',        price: 599,  tag: 'Popular',     desc: 'Cream cheese frosting, moist layers',            imageUrl: 'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?w=600&q=80' },
    { name: 'Almond Cookies (12 pcs)',       price: 249,  tag: 'New',         desc: 'Crunchy, no preservatives, gift box',            imageUrl: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&q=80' },
    { name: 'Blueberry Cheesecake',          price: 449,  tag: 'Trending',    desc: 'New York style, fresh blueberry topping',        imageUrl: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600&q=80' },
    { name: 'Cinnamon Rolls (6 pcs)',        price: 299,  tag: 'Fresh',       desc: 'Soft, gooey, cream cheese glaze',                imageUrl: 'https://images.unsplash.com/photo-1509365465985-25d11c17e812?w=600&q=80' },
  ],
};

const uploadToCloudinary = (imageUrl) =>
  new Promise((resolve) => {
    cloudinary.uploader.upload(imageUrl, {
      folder: 'mandi360/products',
      transformation: [{ width: 600, height: 600, crop: 'fill' }],
    }, (err, result) => {
      if (err) resolve(imageUrl); // fallback to original
      else resolve(result.secure_url);
    });
  });

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB\n');

  const shops = await Shop.find();

  // Remove old demo products (keep merchant's real products)
  const demoOwner = await require('./models/User').findOne({ email: 'demo@mandi360.com' });
  const demoShopIds = shops.filter(s => s.owner.toString() === demoOwner._id.toString()).map(s => s._id);
  await Product.deleteMany({ shop: { $in: demoShopIds } });
  console.log('Cleared old demo products\n');

  for (const shop of shops) {
    const products = PRODUCTS_BY_CATEGORY[shop.category];
    if (!products) { console.log(`⚠ No products defined for category: ${shop.category}`); continue; }

    console.log(`\n📦 Adding products to: ${shop.name} (${shop.category})`);

    for (const p of products) {
      process.stdout.write(`  → ${p.name}... `);
      const imageUrl = await uploadToCloudinary(p.imageUrl);
      await Product.create({
        shop:     shop._id,
        category: shop.category,
        name:     p.name,
        price:    p.price,
        desc:     p.desc,
        tag:      p.tag,
        image:    imageUrl,
        inStock:  true,
      });
      console.log('✅');
    }
  }

  const total = await Product.countDocuments();
  console.log(`\n🎉 Done! Total products in DB: ${total}`);
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
