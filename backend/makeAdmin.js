// Usage: node makeAdmin.js your@email.com
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const email = process.argv[2];
if (!email) { console.log('Usage: node makeAdmin.js <email>'); process.exit(1); }

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const user = await User.findOneAndUpdate({ email }, { role: 'admin' }, { new: true });
  if (!user) console.log('User not found');
  else console.log(`✅ ${user.email} is now admin`);
  process.exit(0);
});
