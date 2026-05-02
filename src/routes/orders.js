import express from 'express';
import { placeOrders, getAllOrders, getOrderById } from '../controllers/orders.js';

const router = express.Router();

router.post('/',placeOrders);
router.get('/', getAllOrders);
router.get('/:orderId', getOrderById);

export default router;