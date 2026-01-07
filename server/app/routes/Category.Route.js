import express from 'express';
import {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
} from '../controllers/Category.Controller.js';
import { userAuth } from '../middleware/userAuth.js';

const router = express.Router();

// Note: Route with middleware - Protected routes (Only logged in users can modify)
router.route('/')
    .post(userAuth, createCategory)
    .get(getCategories);
router.route('/:id')
    .get(getCategoryById)
    .put(userAuth, updateCategory)
    .delete(userAuth, deleteCategory);

export default router;