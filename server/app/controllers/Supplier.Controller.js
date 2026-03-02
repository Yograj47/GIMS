import Supplier from "../models/Supplier.Model.js";
import Product from "../models/Product.Model.js";
import asyncHandler from "express-async-handler";
import { supplierSchema } from "../validation/Supplier.validation.js";
import { createLog } from "../config/Logger.js";

/**
 * @desc    Create a new supplier
 * @route   POST /api/v1/suppliers
 * @access  Private
 * @param   {Object} req.body - Expects { name, contactInfo, address, isActive }
 */
export const createSupplier = asyncHandler(async (req, res) => {
    const validatedData = supplierSchema.parse(req.body);

    const supplier = await Supplier.create(validatedData);

    // LOG: Supplier Creation
    await createLog(
        req.user.id,
        "CREATE",
        "SUPPLIER",
        `Registered new supplier: ${supplier.name}`
    );

    res.status(201).json({
        status: "success",
        data: supplier
    });
})

/**
 * @desc    Get all suppliers (Standard pagination)
 */
export const getSuppliers = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const shouldPaginate = req.query.paginate !== 'false';

    const query = {
        $or: [
            {
                name: { $regex: search, $options: 'i' }
            },
        ]
    }


    let itemsQuery = Supplier.find(query).sort({ name: 1 }).select('-__v');

    if (shouldPaginate) {
        itemsQuery = itemsQuery.skip((page - 1) * limit).limit(limit);
    }

    const [items, totalItems] = await Promise.all([
        itemsQuery,
        Supplier.countDocuments(query)
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
 * @desc    Get a single supplier by its MongoDB ID
 * @route   GET /api/v1/suppliers/:id
 * @access  Private
 */
export const getSupplierById = asyncHandler(async (req, res) => {
    const supplier = await Supplier.findById(req.params.id).select('-__v');

    if (!supplier) {
        res.status(404);
        throw new Error("Supplier not found");
    }

    const products = await Product.find({ supplierId: supplier._id });

    const productData = products.map(p => ({
        _id: p._id,
        name: p.name,
        basePrice: p.basePrice,
        sellingPrice: p.sellingPrice,
        stock: p.quantity
    }));

    res.status(200).json({
        status: "Success",
        data: {
            _id: supplier._id,
            name: supplier.name,
            phone: supplier.phone,
            email: supplier.email,
            address: supplier.address,
            notes: supplier.notes,
            isActive: supplier.isActive
        },
        productData
    });
});

/**
 * @desc    Update a supplier by its MongoDB ID
 * @route   PUT /api/v1/suppliers/:id
 * @access  Private
 * @param   {Object} req.body - Expects
 * {name, contactInfo, address, isActive }
 */
export const updateSupplier = asyncHandler(async (req, res) => {
    const validatedData = supplierSchema.partial().parse(req.body);

    const supplier = await Supplier.findByIdAndUpdate(
        req.params.id,
        { $set: validatedData },
        { new: true, runValidators: true }
    ).select('-__v');

    if (!supplier) {
        res.status(404);
        throw new Error("Supplier not found");
    }

    // LOG: Supplier Update
    await createLog(
        req.user.id,
        "UPDATE",
        "SUPPLIER",
        `Updated information for supplier: ${supplier.name}`
    );

    res.status(200).json({
        status: "Success",
        data: supplier
    });

})

/**
 * @desc    Assign multiple products to a supplier
 * @route   PATCH /api/v1/suppliers/:id/assign-products
 * @access  Private
 */
export const assignProductsToSupplier = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { productIds } = req.body; // Expects an array of IDs: ["id1", "id2"]

    if (!productIds || !Array.isArray(productIds)) {
        res.status(400);
        throw new Error("Please provide an array of product IDs");
    }

    // Verify supplier existence
    const supplier = await Supplier.findById(id);
    if (!supplier) {
        res.status(404);
        throw new Error("Supplier not found");
    }

    const result = await Product.updateMany(
        { _id: { $in: productIds } },
        { $set: { supplierId: id } }
    );

    // LOG: Bulk Assignment
    await createLog(
        req.user.id,
        "UPDATE",
        "SUPPLIER",
        `Linked ${result.modifiedCount} products to supplier: ${supplier.name}`
    );

    res.status(200).json({
        status: "Success",
        message: `${result.modifiedCount} products successfully linked to ${supplier.name}`,
        modifiedCount: result.modifiedCount
    });
});

/**
 * @desc    Unassign a single product from its supplier
 * @route   PATCH /api/v1/suppliers/unassign-product/:productId
 * @access  Private
 */
export const unassignProduct = asyncHandler(async (req, res) => {
    const { productId } = req.params;

    const product = await Product.findByIdAndUpdate(
        productId,
        { $unset: { supplierId: "" } }, // Removes the field entirely
        { new: true }
    );

    if (!product) {
        res.status(404);
        throw new Error("Product not found");
    }

    // LOG: Product Unassignment
    await createLog(
        req.user.id,
        "UPDATE",
        "SUPPLIER",
        `Removed product "${product.name}" from its supplier catalog`
    );

    res.status(200).json({
        status: "Success",
        message: "Product removed from supplier catalog"
    });
});

/** 
 * @desc    Delete a supplier by its MongoDB ID
 * @route   DELETE /api/v1/suppliers/:id
 * @access  Private
 */
export const deleteSupplier = asyncHandler(async (req, res) => {
    const supplier = await Supplier.findByIdAndDelete(req.params.id).select('-__v');

    if (!supplier) {
        res.status(404);
        throw new Error("Supplier not found");
    }

    // LOG: Supplier Deletion
    await createLog(
        req.user.id,
        "DELETE",
        "SUPPLIER",
        `Permanently removed supplier: ${supplier.name}`
    );

    res.status(200).json({
        status: "Success",
        message: "Supplier Deleted Successfully"
    });
})
