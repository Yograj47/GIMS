import Category from '../models/Category.Model.js';
import Product from '../models/Product.Model.js';
import asyncHandler from 'express-async-handler';
import { categorySchema } from '../validation/Category.validation.js';

/**
 * @desc    Create a new category
 * @route   POST /api/v1/categories
 * @access  Private/Admin
*/
export const createCategory = asyncHandler(async (req, res) => {
    // 1. Validate input
    const validatedData = categorySchema.parse(req.body);

    // 2. Check for existing category (Avoid Duplicate Key error from MongoDB)
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
 * @desc    Get all categories
 * @route   GET /api/v1/categories
 * @access  Public
*/
export const getCategories = asyncHandler(async (req, res) => {

    const categories = await Category.find({});

    res.status(200).json({
        status: "success",
        results: categories.length,
        data: categories
    });
});

// @desc Get category by ID
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

// @desc Update category by ID
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
        message: "Category updated",
        data: updatedCategory
    });
});

// @desc Delete category by ID
export const deleteCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // 1. Check if any products are using this category
    const productsUsingCategory = await Product.countDocuments({ category: id });

    if (productsUsingCategory > 0) {
        res.status(400);
        throw new Error(
            `Cannot delete category. There are ${productsUsingCategory} products assigned to it.`
        );
    }

    // 2. Proceed with deletion if safe
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