import express from "express"
import { addToCart, getCart, deleteFromCart, updateCart ,paymentSummaryDetails } from "../controllers/cart.js";
import { optionalAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get('/:cartId', optionalAuth, getCart);
router.post('/', optionalAuth, addToCart);
router.delete('/:cartId/items/:productId', optionalAuth, deleteFromCart);
router.put('/:cartId/items/:productId', optionalAuth, updateCart);
router.get('/:cartId/summary', optionalAuth, paymentSummaryDetails);

export default router;
