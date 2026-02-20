import express from 'express';
import {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
} from '../controllers/Category.Controller.js';
import { userAuth } from '../middleware/Auth.middleware.js';
import rbac from '../middleware/Role.middleware.js';

const router = express.Router();

router.route('/')
    .post(userAuth, rbac("category:write"),createCategory)
    .get(userAuth, rbac("category:read"), getCategories);
router.route('/:id')
    .get(userAuth, rbac("category:read"), getCategoryById)
    .put(userAuth, rbac("category:write"), updateCategory)
    .delete(userAuth, rbac("category:delete"), deleteCategory);

export default router;