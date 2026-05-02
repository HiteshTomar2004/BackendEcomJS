import express from "express"
import { addToCart, getCart, deleteFromCart, updateCart ,paymentSummaryDetails } from "../controllers/cart.js";

const router = express.Router();

router.get('/:cartId', getCart);
router.post('/', addToCart);
router.delete('/:cartId/items/:productId', deleteFromCart);
router.put('/:cartId/items/:productId', updateCart);
router.get('/:cartId/summary', paymentSummaryDetails);

export default router;
