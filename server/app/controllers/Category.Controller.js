import Category from '../models/Category.Model.js';
import Product from '../models/Product.Model.js';
import asyncHandler from 'express-async-handler';
import { categorySchema } from '../validation/Category.validation.js';

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

    res.status(201).json({
        status: "success",
        data: createdCategory
    });
});

/**
 * @desc    Get all categories sorted alphabetically
 * @route   GET /api/v1/categories
 * @access  Public
 */
export const getCategories = asyncHandler(async (req, res) => {
    // Sorting by name: 1 ensures a clean list for frontend dropdowns
    const categories = await Category.find({}).sort({ name: 1 }).select('-__v');

    res.status(200).json({
        status: "success",
        results: categories.length,
        data: categories
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
        status: "success",
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

    res.status(200).json({
        status: "success",
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

    res.status(200).json({
        status: "success",
        message: 'Category removed successfully'
    });
});