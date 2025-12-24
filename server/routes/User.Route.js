import express from 'express';
import { getMe } from '../controllers/User.Controller.js';
import { userAuth } from '../middleware/userAuth.js';

const router = express.Router();

// Example route: Get user profile
router.get('/profile', userAuth, getMe)

export default router;