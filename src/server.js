import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { prisma } from './config/db.js'
import productRoutes from './routes/products.js'
import userRoutes from './routes/users.js'

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
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


app.use('/api/users', userRoutes);

app.use('/api/products', productRoutes);

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