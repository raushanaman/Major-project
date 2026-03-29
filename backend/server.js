const env       = require('./src/config/env');
const express   = require('express');
const cors      = require('cors');
const connectDB = require('./src/config/db');

const authRoutes    = require('./src/modules/auth/auth.routes');
const shopRoutes    = require('./src/modules/shop/shop.routes');
const productRoutes = require('./src/modules/product/product.routes');
const orderRoutes   = require('./src/modules/order/order.routes');
const paymentRoutes = require('./src/modules/payment/payment.routes');
const adminRoutes   = require('./src/modules/admin/admin.routes');
const reviewRoutes  = require('./src/modules/review/review.routes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth',     authRoutes);
app.use('/api/shops',    shopRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders',   orderRoutes);
app.use('/api/payment',  paymentRoutes);
app.use('/api/admin',    adminRoutes);
app.use('/api/reviews',  reviewRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

connectDB().then(() => {
  app.listen(env.PORT, () =>
    console.log(`Server running on port ${env.PORT}`)
  );
});
