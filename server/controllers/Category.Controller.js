import asyncHandler from 'express-async-handler';
import Category from '../models/Category.Model.js';

// @desc    Create a new category
// @route   POST /api/v1/categories
// @access  Private/Admin
export const createCategory = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    if (!name) {
        res.status(400);
        throw new Error('Category name is required');
    }

    const category = Category.create({ name, description });
    const createdCategory = await category.save();

    if (!createdCategory) {
        res.status(500);
        throw new Error('Failed to create category');
    }

    res.status(201).json(createdCategory);
});

// @desc    Get all categories
// @route   GET /api/v1/categories
// @access  Public
export const getCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find({});
    res.json(categories);
});

// @desc    Get category by ID
// @route   GET /api/v1/categories/:id
// @access  Public
export const getCategoryById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id) {
        res.status(400);
        throw new Error('Category ID is required');
    }

    const category = await Category.findById(id);
    if (!category) {
        res.status(404);
        throw new Error('Category not found');
    }
    res.json(category.select('-__v', '-createdAt', '-updatedAt'));
});

// @desc    Update category by ID
// @route   PUT /api/v1/categories/:id
// @access  Private/Admin
export const updateCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!id) {
        res.status(400);
        throw new Error('Category ID is required');
    }

    const category = await Category.findById(id);
    if (!category) {
        res.status(404);
        throw new Error('Category not found');
    }

    const updatedCategory = await Category.findByIdAndUpdate(
        id,
        { name, description },
        { new: true }
    );

    if (!updatedCategory) {
        res.status(500);
        throw new Error('Failed to update category');
    }

    res.json(updatedCategory.select('-__v', '-createdAt', '-updatedAt'));
});

// @desc    Delete category by ID
// @route   DELETE /api/v1/categories/:id
// @access  Private/Admin
export const deleteCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!id) {
        res.status(400);
        throw new Error('Category ID is required');
    }
    const category = await Category.findById(id);
    if (!category) {
        res.status(404);
        throw new Error('Category not found');
    }
    await category.remove();
    res.json({ message: 'Category removed' });
});
