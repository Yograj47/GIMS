import express from 'express';
import { getMe, getAllUsers } from '../controllers/User.Controller.js';
import { userAuth } from '../middleware/Auth.middleware.js';
import rbac from "../middleware/Role.middleware.js";

const router = express.Router();

// Example route: Get user profile
router.get('/profile', userAuth, getMe);
router.get('/all', userAuth, rbac("all"), getAllUsers);

export default router;