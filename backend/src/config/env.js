require('dotenv').config();

const env = {
  PORT:        process.env.PORT        || 5000,
  MONGO_URI:   process.env.MONGO_URI,
  JWT_SECRET:  process.env.JWT_SECRET,
  EMAIL_USER:  process.env.EMAIL_USER,
  EMAIL_PASS:  process.env.EMAIL_PASS,
  CLIENT_URL:  process.env.CLIENT_URL  || 'http://localhost:5173',

  // Cloudinary (to be filled later)
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY:    process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,

  // Razorpay (to be filled later)
  RAZORPAY_KEY_ID:     process.env.RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
};

// Validate required env variables
const required = ['MONGO_URI', 'JWT_SECRET', 'EMAIL_USER', 'EMAIL_PASS'];
// Note: RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET will be validated when payment feature is enabled
required.forEach(key => {
  if (!env[key]) {
    console.error(`Missing required env variable: ${key}`);
    process.exit(1);
  }
});

module.exports = env;
