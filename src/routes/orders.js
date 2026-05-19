import express from 'express';
import { placeOrders, getAllOrders, getOrderById } from '../controllers/orders.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, placeOrders);
router.get('/', protect, getAllOrders);
router.get('/:orderId', protect, getOrderById);

export default router;