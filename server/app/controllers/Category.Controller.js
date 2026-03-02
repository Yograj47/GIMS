import Category from '../models/Category.Model.js';
import Product from '../models/Product.Model.js';
import asyncHandler from 'express-async-handler';
import { categorySchema } from '../validation/Category.validation.js';
import { createLog } from "../config/Logger.js";

/**
 * @desc    Create a new category
 * @route   POST /api/v1/categories
 * @access  Private/Admin
 * @param   {Object} req.body - Expects { name, description }
 */
export const createCategory = asyncHandler(async (req, res) => {
    // 1. Validate input via Zod
    const validatedData = categorySchema.parse(req.body);

    // 2. Prevent duplicate entries before hitting DB
    const categoryExists = await Category.findOne({ name: validatedData.name });
    if (categoryExists) {
        res.status(400);
        throw new Error('Category name already exists');
    }

    const createdCategory = await Category.create(validatedData);

    // LOG: Category Creation
    await createLog(
        req.user.id,
        "CREATE",
        "CATEGORY",
        `Created new product category: ${createdCategory.name}`
    );

    res.status(201).json({
        status: "Success",
        data: createdCategory
    });
});

/**
 * @desc    Get all categories sorted alphabetically
 * @route   GET /api/v1/categories
 * @access  Public
 */
export const getCategories = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const search = req.query.search || '';
    const shouldPaginate = req.query.paginate !== 'false';

    const query = {
        $or: [
            { name: { $regex: search, $options: 'i' } },
        ]
    }

    let itemsQuery = Category.find(query).sort({ createdAt: -1 }).select('-__v');

    if (shouldPaginate) {
        itemsQuery = itemsQuery.skip((page - 1) * limit).limit(limit);
    }

    const [items, totalItems] = await Promise.all([
        itemsQuery,
        Category.countDocuments(query)
    ])

    res.status(200).json({
        status: "Success",
        data: items,
        meta: shouldPaginate ? {
            totalItems,
            itemsPerPage: items.length,
            currentPage: page,
            totalPages: Math.ceil(totalItems / limit),
        } : {
            totalItems,
            itemsPerPage: items.length,
            paginationDisabled: true
        }
    });
});

/**
 * @desc    Get a single category by its MongoDB ID
 * @route   GET /api/v1/categories/:id
 * @access  Public
 */
export const getCategoryById = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id).select('-__v');

    if (!category) {
        res.status(404);
        throw new Error('Category not found');
    }

    res.status(200).json({
        status: "Success",
        data: category
    });
});

/**
 * @desc    Update category details by ID
 * @route   PUT /api/v1/categories/:id
 * @access  Private/Admin
 */
export const updateCategory = asyncHandler(async (req, res) => {
    const validatedData = categorySchema.parse(req.body);

    const updatedCategory = await Category.findByIdAndUpdate(
        req.params.id,
        validatedData,
        { new: true, runValidators: true }
    ).select('-__v');

    if (!updatedCategory) {
        res.status(404);
        throw new Error('Category not found');
    }

    // LOG: Category Update
    await createLog(
        req.user.id,
        "UPDATE",
        "CATEGORY",
        `Renamed/Modified category: ${updatedCategory.name}`
    );

    res.status(200).json({
        status: "Success",
        message: "Category updated successfully",
        data: updatedCategory
    });
});

/**
 * @desc    Delete category by ID (checks for linked products first)
 * @route   DELETE /api/v1/categories/:id
 * @access  Private/Admin
 */
export const deleteCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // 1. Referential Integrity: Check if any products are using this category
    const productsUsingCategory = await Product.countDocuments({ category: id });

    if (productsUsingCategory > 0) {
        res.status(400);
        throw new Error(
            `Cannot delete category. There are ${productsUsingCategory} products assigned to it.`
        );
    }

    // 2. Proceed with deletion if no dependencies found
    const category = await Category.findByIdAndDelete(id);

    if (!category) {
        res.status(404);
        throw new Error('Category not found');
    }

    // LOG: Category Deletion
    await createLog(
        req.user.id,
        "DELETE",
        "CATEGORY",
        `Deleted category: ${category.name}`
    );

    res.status(200).json({
        status: "Success",
        message: 'Category removed successfully'
    });
});