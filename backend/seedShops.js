require('dotenv').config();
const mongoose  = require('mongoose');
const cloudinary = require('cloudinary').v2;
const https     = require('https');
const http      = require('http');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

require('./models/User');
const Shop = require('./models/Shop');
const User = require('./models/User');

// Demo shops data - 3 per category
const DEMO_SHOPS = [
  // Groceries
  { name: 'Fresh Basket',       category: 'groceries',   city: 'Mumbai',    phone: '9876543210', address: 'Andheri West, Mumbai',       rating: 4.8, reviews: 312, imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80' },
  { name: 'Green Valley Mart',  category: 'groceries',   city: 'Delhi',     phone: '9876543211', address: 'Connaught Place, Delhi',      rating: 4.5, reviews: 198, imageUrl: 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=600&q=80' },
  { name: 'Organic Hub',        category: 'groceries',   city: 'Bangalore', phone: '9876543212', address: 'Indiranagar, Bangalore',      rating: 4.9, reviews: 421, imageUrl: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=600&q=80' },
  // Electronics
  { name: 'TechZone',           category: 'electronics', city: 'Mumbai',    phone: '9876543213', address: 'Linking Road, Bandra',        rating: 4.7, reviews: 289, imageUrl: 'https://images.unsplash.com/photo-1491933382434-500287f9b54b?w=600&q=80' },
  { name: 'Gadget Galaxy',      category: 'electronics', city: 'Hyderabad', phone: '9876543214', address: 'Hitech City, Hyderabad',      rating: 4.4, reviews: 176, imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80' },
  { name: 'Smart Electronics',  category: 'electronics', city: 'Delhi',     phone: '9876543215', address: 'Nehru Place, Delhi',          rating: 4.6, reviews: 334, imageUrl: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=600&q=80' },
  // Sports
  { name: 'ProSports Arena',    category: 'sports',      city: 'Pune',      phone: '9876543216', address: 'FC Road, Pune',               rating: 4.8, reviews: 267, imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&q=80' },
  { name: 'FitGear Store',      category: 'sports',      city: 'Mumbai',    phone: '9876543217', address: 'Dadar, Mumbai',               rating: 4.3, reviews: 154, imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80' },
  { name: 'Champion Sports',    category: 'sports',      city: 'Bangalore', phone: '9876543218', address: 'Koramangala, Bangalore',      rating: 4.6, reviews: 209, imageUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&q=80' },
  // Clothing
  { name: 'Style Studio',       category: 'clothing',    city: 'Mumbai',    phone: '9876543219', address: 'Colaba, Mumbai',              rating: 4.9, reviews: 512, imageUrl: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600&q=80' },
  { name: 'Urban Threads',      category: 'clothing',    city: 'Delhi',     phone: '9876543220', address: 'Lajpat Nagar, Delhi',         rating: 4.5, reviews: 378, imageUrl: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&q=80' },
  { name: 'Ethnic Wear House',  category: 'clothing',    city: 'Jaipur',    phone: '9876543221', address: 'Johari Bazaar, Jaipur',       rating: 4.7, reviews: 291, imageUrl: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=600&q=80' },
  // Cosmetics
  { name: 'Glow Beauty',        category: 'cosmetics',   city: 'Mumbai',    phone: '9876543222', address: 'Juhu, Mumbai',                rating: 4.8, reviews: 445, imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80' },
  { name: 'Luxe Cosmetics',     category: 'cosmetics',   city: 'Bangalore', phone: '9876543223', address: 'MG Road, Bangalore',          rating: 4.6, reviews: 322, imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80' },
  { name: 'Natural Beauty Co.', category: 'cosmetics',   city: 'Chennai',   phone: '9876543224', address: 'T Nagar, Chennai',            rating: 4.4, reviews: 187, imageUrl: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&q=80' },
  // Furniture
  { name: 'Home Comfort',       category: 'furniture',   city: 'Pune',      phone: '9876543225', address: 'Viman Nagar, Pune',           rating: 4.5, reviews: 203, imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80' },
  { name: 'Wood & Craft',       category: 'furniture',   city: 'Delhi',     phone: '9876543226', address: 'Kirti Nagar, Delhi',          rating: 4.7, reviews: 156, imageUrl: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=600&q=80' },
  { name: 'Modern Living',      category: 'furniture',   city: 'Mumbai',    phone: '9876543227', address: 'Lower Parel, Mumbai',         rating: 4.6, reviews: 241, imageUrl: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=600&q=80' },
  // Bakery
  { name: 'Golden Crust Bakery',category: 'bakery',      city: 'Bangalore', phone: '9876543228', address: 'Jayanagar, Bangalore',        rating: 4.8, reviews: 567, imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80' },
  { name: 'Sweet Delights',     category: 'bakery',      city: 'Mumbai',    phone: '9876543229', address: 'Bandra West, Mumbai',         rating: 4.5, reviews: 312, imageUrl: 'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=600&q=80' },
  { name: 'Sunrise Bakehouse',  category: 'bakery',      city: 'Delhi',     phone: '9876543230', address: 'Hauz Khas, Delhi',            rating: 4.3, reviews: 178, imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&q=80' },
];

const uploadToCloudinary = (imageUrl) =>
  new Promise((resolve, reject) => {
    cloudinary.uploader.upload(imageUrl, {
      folder: 'mandi360/shops',
      transformation: [{ width: 800, height: 500, crop: 'fill' }],
    }, (err, result) => {
      if (err) reject(err);
      else resolve(result.secure_url);
    });
  });

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');

  // Get or create a demo owner user
  let demoOwner = await User.findOne({ email: 'demo@mandi360.com' });
  if (!demoOwner) {
    const bcrypt = require('bcryptjs');
    demoOwner = await User.create({
      firstName: 'Demo', lastName: 'Owner',
      email: 'demo@mandi360.com',
      password: await bcrypt.hash('Demo@1234', 10),
      role: 'merchant',
    });
    console.log('Created demo owner');
  }

  // Remove old demo shops (keep real merchant shops)
  await Shop.deleteMany({ owner: demoOwner._id });
  console.log('Cleared old demo shops');

  for (const shopData of DEMO_SHOPS) {
    process.stdout.write(`Uploading image for ${shopData.name}... `);
    let imageUrl = '';
    try {
      imageUrl = await uploadToCloudinary(shopData.imageUrl);
      console.log('✓');
    } catch (e) {
      console.log('✗ (using original URL)');
      imageUrl = shopData.imageUrl;
    }

    await Shop.create({
      owner:   demoOwner._id,
      name:    shopData.name,
      category: shopData.category,
      city:    shopData.city,
      phone:   shopData.phone,
      address: shopData.address,
      rating:  shopData.rating,
      reviews: shopData.reviews,
      status:  'open',
      image:   imageUrl,
    });
    console.log(`✅ Created: ${shopData.name}`);
  }

  console.log('\n🎉 Seeding complete! Total shops:', DEMO_SHOPS.length);
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
