import mongoose from "mongoose";
import { AppError } from "../../shared/errors/index.js";
import ProductUnit from "../product-unit/product-unit.model.js";
import { prepareProductPhotos, removeProductPhotos, writeProductPhotos } from "./product-media.js";

import {
    findProductById,
    createProduct,
    updateProductById,
    deleteProductById,
    findProductByName,
    findProducts,
    findProductStock,
} from "./product.repository.js";

import {
    findCategoryById,
} from "../category/category.repository.js";

import {
    findUnitById,
} from "../unit/unit.repository.js";

import {
    findSupplierById,
} from "../supplier/supplier.repository.js";

export const create = async (
    { photos, ...payload },
    uploadedBy
) => {
    const {
        name,
        categoryId,
        unitId,
        supplierId,
    } = payload;

    const existingProduct =
        await findProductByName(name);

    if (existingProduct) {
        throw AppError.conflict(
            "Product already exists"
        );
    }

    const category =
        await findCategoryById(
            categoryId
        );

    if (!category) {
        throw AppError.notFound(
            "Category not found"
        );
    }

    const unit =
        await findUnitById(unitId);

    if (!unit) {
        throw AppError.notFound(
            "Unit not found"
        );
    }

    if (supplierId) {
        const supplier =
            await findSupplierById(
                supplierId
            );

        if (!supplier) {
            throw AppError.notFound(
                "Supplier not found"
            );
        }
    }

    const prepared = photos && await prepareProductPhotos(photos);
    return mongoose.connection.transaction(async (session) => {
        const product = await createProduct(payload, session);
        await ProductUnit.create([{
            productId: product._id, unitId: unit._id, multiplier: unit.multiplierToBase,
            isDefault: true, isFractionable: unit.isFractional, isActive: true,
        }], { session });
        if (prepared?.length) {
            product.photos = await writeProductPhotos(product._id, prepared, uploadedBy, session);
            await product.save({ session });
        }
        return product;
    });
};

export const find = async ({
    page = 1,
    limit = 10,
    search = "",
    category,
    stockLevel,
    sort = "recent",
    paginate = true,
}) => {
    const query = {};
    const sorts = new Map([
        ["recent", { createdAt: -1 }],
        ["name", { name: 1 }],
        ["stock", { quantity: 1 }],
    ]);
    if (!sorts.has(sort)) throw AppError.badRequest("Invalid product sort");

    if (search) {
        query.name = {
            $regex: search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
            $options: "i",
        };
    }

    if (category) {
        if (typeof category !== "string" || !mongoose.isObjectIdOrHexString(category)) {
            throw AppError.badRequest("Invalid category filter");
        }
        query.categoryId = new mongoose.Types.ObjectId(category);
    }

    if (stockLevel === "out") query.quantity = { $lte: 0 };
    else if (stockLevel === "low" || stockLevel === "healthy") {
        query.quantity = { $gt: 0 };
        query.$expr = {
            [stockLevel === "low" ? "$lte" : "$gt"]: ["$quantity", "$threshold"],
        };
    } else if (stockLevel) throw AppError.badRequest("Invalid stock level filter");

    const {
        items,
        totalItems,
    } = await findProducts(
        query,
        {
            page,
            limit,
            paginate,
            sort: sorts.get(sort),
        }
    );

    return {
        items,
        totalItems,
        page,
        limit,
        paginate,
    };
};

export const findById = async (
    productId
) => {
    const product =
        await findProductById(
            productId
        );

    if (!product) {
        throw AppError.notFound(
            "Product not found"
        );
    }

    return product;
};

export const update = async (
    productId,
    { photos, ...payload },
    uploadedBy
) => {
    if (payload.categoryId) {
        const category =
            await findCategoryById(
                payload.categoryId
            );

        if (!category) {
            throw AppError.notFound(
                "Category not found"
            );
        }
    }

    if (payload.unitId) {
        const unit =
            await findUnitById(
                payload.unitId
            );

        if (!unit) {
            throw AppError.notFound(
                "Unit not found"
            );
        }
    }

    if (payload.supplierId) {
        const supplier =
            await findSupplierById(
                payload.supplierId
            );

        if (!supplier) {
            throw AppError.notFound(
                "Supplier not found"
            );
        }
    }

    const prepared = photos && await prepareProductPhotos(photos);
    const product = prepared === undefined
        ? await updateProductById(productId, payload)
        : await mongoose.connection.transaction(async (session) => {
            const current = await updateProductById(productId, payload, session);
            if (!current) return null;
            current.photos = await writeProductPhotos(current._id, prepared, uploadedBy, session);
            await current.save({ session });
            return current;
        });

    if (!product) {
        if (await findProductStock(productId)) {
            throw AppError.conflict("Check that selling price covers cost. Use stock movements for quantity changes, and change the base unit only before stock is recorded.");
        }
        throw AppError.notFound(
            "Product not found"
        );
    }

    return product;
};

export const remove = async (
    productId
) => {
    const product = await mongoose.connection.transaction(async (session) => {
        const deleted = await deleteProductById(productId, session);
        if (deleted?.photos.length) await removeProductPhotos(deleted._id, [], session);
        return deleted;
    });

    if (!product) {
        if ((await findProductStock(productId))?.hasStockLots) {
            throw AppError.conflict("Deactivate this product to preserve its receipt history");
        }
        throw AppError.notFound(
            "Product not found"
        );
    }

    return product;
};
