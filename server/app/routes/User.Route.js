import express from 'express';
import { getMe, getAllUsers } from '../controllers/User.Controller.js';
import { userAuth } from '../middleware/Auth.middleware.js';
import rbac from "../middleware/Role.middleware.js";

const router = express.Router();
router.use(userAuth);

router.get('/profile', getMe);
router.get('/all', rbac("all"), getAllUsers);

export default router;