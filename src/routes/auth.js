import express from 'express';
import { registerUser, loginUser, logoutUser, logoutAllDevices} from '../controllers/auth.js'
import { protect } from '../middleware/authMiddleware.js';
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/logout-all', protect, logoutAllDevices);

export default router;