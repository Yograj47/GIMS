import express from 'express';
import { getMe, getAllUsers, UpdatePassword, updateUserDetails } from '../controllers/User.Controller.js';
import { userAuth } from '../middleware/Auth.middleware.js';
import rbac from "../middleware/Role.middleware.js";

const router = express.Router();
router.use(userAuth);

router.get('/profile', getMe);
router.get('/all', rbac("user:read"), getAllUsers);
router.patch('/update-password/:id', UpdatePassword);
router.patch('/update-details/:id', updateUserDetails);

export default router;