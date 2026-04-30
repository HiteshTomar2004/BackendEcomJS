import express from 'express';
import { createUser, fetchUser } from '../controllers/users.js';

const router = express.Router();

router.post('/', createUser);
router.get('/', fetchUser);

export default router;