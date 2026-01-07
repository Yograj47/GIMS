import asyncHandler from "express-async-handler";
import Product from "../models/Product.Model.js"
import Category from "../models/Category.Model.js"
import Unit from "../models/Unit.Model.js"

/** 
 * @desc    Create new product
 * @route   POST /api/v1/products
 * @access  Private
 */
export const createProduct = asyncHandler(async (req, res) => {
    const {
        name,
        categoryId,
        unitId,
        quantity,
        threshold,
        supplierId,
        basePrice,
        sellingPrice
    } = req.body;

    if (!name || !categoryId || !unitId || threshold == null || basePrice == null || sellingPrice == null) {
        res.status(400);
        throw new Error("Please fill the required fields");
    }

    const categoryExist = await Category.findById(categoryId);
    if (!categoryExist) {
        res.status(400);
        throw new Error("Category does not exist");
    }

    const unitExist = await Unit.findById(unitId);
    if (!unitExist) {
        res.status(400);
        throw new Error("Unit does not exist");
    }

    const product = await Product.create({
        name,
        categoryId,
        unitId,
        quantity,
        threshold,
        supplierId,
        basePrice,
        sellingPrice
    });

    res.status(201).json({
        success: true,
        data: product
    });
});


/**
 * @desc    Get all the products
 * @route   GET /api/v1/products
 * @access  Private
 */
export const getProducts = asyncHandler(async (req, res) => {
    const products = await Product.find()
        .populate({
            path: "categoryId",
            select: "name"
        })
        .populate({
            path: "unitId",
            select: "name shortForm"
        })
        .populate({
            path: "supplierId",
            select: "name"
        })
        .lean();

    const response = products.map(p => ({
        _id: p._id,
        name: p.name,
        quantity: p.quantity,
        threshold: p.threshold,
        basePrice: p.basePrice,
        sellingPrice: p.sellingPrice,
        category: p.categoryId,
        unit: p.unitId,
        supplier: p.supplierId,
        isActive: p.isActive,
        createdAt: p.createdAt
    }))

    res.status(200).json({
        success: true,
        data: response
    })


})

/**
 * @desc Get product by id
 * @route GET /api/v1/products/:productId
 * @param  {Object} req - expects {productId}
 * @access  Private
 */
export const getProductById = asyncHandler(async (req, res) => {
    const { productId } = req.params;

    const product = await Product.findOne({ _id: productId })
        .populate("categoryId", "name")
        .populate("unitId", "name shortForm")
        .populate("supplierId", "name")
        .lean();

    if (!product) {
        res.status(400);
        throw new Error("Product not found");
    }

    const response = {
        ...product,
        category: product.categoryId,
        unit: product.unitId,
        supplier: product.supplierId,
        categoryId: undefined,
        unitId: undefined,
        supplierId: undefined
    };

    res.status(200).json({
        success: true,
        data: response
    });
})

/**
 * @desc Update product by id
 * @route PUT /api/v1/products/:productId
 * @param  {Object} req - expects {productId}  
 * @access  Private
 */
export const UpdateProductById = asyncHandler(async (req, res) => {


})

/**
 * @desc DELETE product by id
 * @route DELETE /api/v1/products/:productId
 * @param  {Object} req - expects {productId}
 * @access  Private
 */
export const deleteProductById = asyncHandler(async (req, res) => {

})