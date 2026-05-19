import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { prisma } from './config/db.js';
import productRoutes from './routes/products.js';
import userRoutes from './routes/users.js';
import deliveryOptionsRoutes from './routes/deliveryOptions.js';
import cartRoutes from './routes/cart.js';
import ordersRoutes from './routes/orders.js';
import cookieParser from 'cookie-parser';
import auth from './routes/auth.js'
import { protect } from './middleware/authMiddleware.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'express backend LUL'
  });
});

app.get('/api/status', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API works'
  });
});

app.use('/images', express.static('images'));

app.use('/api/users', userRoutes);

app.use('/api/products', productRoutes);

app.use('/api/deliveryOptions', deliveryOptionsRoutes);

app.use('/api/cart', cartRoutes);

app.use('/api/orders', protect ,ordersRoutes);

app.use('./api/auth', auth);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint failure'
  });
});

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});


process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});