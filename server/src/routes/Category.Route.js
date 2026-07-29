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
router.use(userAuth);

router.route('/')
    .post(rbac("category:write"), createCategory)
    .get(rbac("category:read"), getCategories);
router.route('/:id')
    .get(rbac("category:read"), getCategoryById)
    .put(rbac("category:write"), updateCategory)
    .delete(rbac("category:delete"), deleteCategory);

export default router;