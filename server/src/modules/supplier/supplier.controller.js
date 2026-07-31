import asyncHandler from "express-async-handler";

import {
    createSupplierSchema,
    updateSupplierSchema,
} from "./supplier.validation.js";

import {
    createSupplier,
    getAllSuppliers,
    getSupplier,
    updateSupplier,
    assignProducts,
    unassignProduct,
    removeSupplier,
} from "./supplier.service.js";

export const createSupplier = asyncHandler(async (req, res) => {
    const payload = createSupplierSchema.parse(req.body);

    const supplier = await createSupplier(payload);

    res.status(201).json({
        success: true,
        data: supplier,
    });
});

export const getSuppliers = asyncHandler(async (req, res) => {
    const result = await getAllSuppliers({
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 10,
        search: req.query.search || "",
        paginate: req.query.paginate !== "false",
    });

    res.status(200).json({
        success: true,
        data: result.suppliers,
        meta: result.meta,
    });
});

export const getSupplierById = asyncHandler(async (req, res) => {
    const result = await getSupplier(req.params.id);

    res.status(200).json({
        success: true,
        data: result.supplier,
        products: result.products,
    });
});

export const updateSupplier = asyncHandler(async (req, res) => {
    const payload = updateSupplierSchema.parse(req.body);

    const supplier = await updateSupplier(
        req.params.id,
        payload
    );

    res.status(200).json({
        success: true,
        data: supplier,
    });
});

export const assignProductsToSupplier = asyncHandler(async (req, res) => {
    const { productIds } = req.body;

    const result = await assignProducts({
        supplierId: req.params.id,
        productIds,
    });

    res.status(200).json({
        success: true,
        message: `${result.modifiedCount} products assigned successfully`,
        modifiedCount: result.modifiedCount,
    });
});

export const unassignProduct = asyncHandler(async (req, res) => {
    await unassignProduct(req.params.productId);

    res.status(200).json({
        success: true,
        message: "Product unassigned successfully",
    });
});

export const deleteSupplier = asyncHandler(async (req, res) => {
    await removeSupplier(req.params.id);

    res.status(200).json({
        success: true,
        message: "Supplier deleted successfully",
    });
});