import { Router } from "express";

import {
    authenticate,
    authorize,
} from "../../shared/middlewares/index.js";

import {
    PERMISSIONS,
} from "../../shared/constants/index.js";

import {
    createCategory,
    findCategories,
    findCategoryById,
    updateCategory,
    deleteCategory,
} from "./category.controller.js";

const router = Router();

router
    .route("/")
    .get(
        authenticate,
        authorize(
            PERMISSIONS.CATEGORY_READ
        ),
        findCategories
    )
    .post(
        authenticate,
        authorize(
            PERMISSIONS.CATEGORY_WRITE
        ),
        createCategory
    );

router
    .route("/:id")
    .get(
        authenticate,
        authorize(
            PERMISSIONS.CATEGORY_READ
        ),
        findCategoryById
    )
    .put(
        authenticate,
        authorize(
            PERMISSIONS.CATEGORY_WRITE
        ),
        updateCategory
    )
    .delete(
        authenticate,
        authorize(
            PERMISSIONS.CATEGORY_WRITE
        ),
        deleteCategory
    );

export default router;