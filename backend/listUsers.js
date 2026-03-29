require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const users = await User.find({}, 'email firstName role');
  if (users.length === 0) console.log('No users found in DB');
  else users.forEach(u => console.log(`${u.email} | ${u.firstName} | role: ${u.role}`));
  process.exit(0);
});
