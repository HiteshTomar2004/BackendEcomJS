import express from 'express';
import { registerUser, loginUser, logoutUser, logoutAllDevices} from '../controllers/auth.js'

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/logout-all', logoutAllDevices);

export default router;