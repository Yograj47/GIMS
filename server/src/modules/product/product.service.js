import {
    findProductById,
    createProduct,
    updateProductById,
    deleteProductById,
    findProductByName,
    findProducts,
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

import {
    create as createProductUnit,
} from "../productUnit/product-unit.service.js";

export const create = async (
    payload
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
        const error = new Error(
            "Product already exists"
        );
        error.statusCode = 409;
        throw error;
    }

    const category =
        await findCategoryById(
            categoryId
        );

    if (!category) {
        const error = new Error(
            "Category not found"
        );
        error.statusCode = 404;
        throw error;
    }

    const unit =
        await findUnitById(unitId);

    if (!unit) {
        const error = new Error(
            "Unit not found"
        );
        error.statusCode = 404;
        throw error;
    }

    if (supplierId) {
        const supplier =
            await findSupplierById(
                supplierId
            );

        if (!supplier) {
            const error = new Error(
                "Supplier not found"
            );
            error.statusCode = 404;
            throw error;
        }
    }

    const product =
        await createProduct(payload);

    await createProductUnit({
        productId: product._id,
        unitId: unit._id,
        multiplier:
            unit.multiplierToBase,
        isDefault: true,
        isFractionable:
            unit.isFractional,
        isActive: true,
    });

    return product;
};

export const find = async ({
    page = 1,
    limit = 10,
    search = "",
    paginate = true,
}) => {
    const query = {};

    if (search) {
        query.name = {
            $regex: search,
            $options: "i",
        };
    }

    const {
        items,
        totalItems,
    } = await findProducts(
        query,
        {
            page,
            limit,
            paginate,
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
        const error = new Error(
            "Product not found"
        );
        error.statusCode = 404;
        throw error;
    }

    return product;
};

export const update = async (
    productId,
    payload
) => {
    if (payload.categoryId) {
        const category =
            await findCategoryById(
                payload.categoryId
            );

        if (!category) {
            const error = new Error(
                "Category not found"
            );
            error.statusCode = 404;
            throw error;
        }
    }

    if (payload.unitId) {
        const unit =
            await findUnitById(
                payload.unitId
            );

        if (!unit) {
            const error = new Error(
                "Unit not found"
            );
            error.statusCode = 404;
            throw error;
        }
    }

    if (payload.supplierId) {
        const supplier =
            await findSupplierById(
                payload.supplierId
            );

        if (!supplier) {
            const error = new Error(
                "Supplier not found"
            );
            error.statusCode = 404;
            throw error;
        }
    }

    const product =
        await updateProductById(
            productId,
            payload
        );

    if (!product) {
        const error = new Error(
            "Product not found"
        );
        error.statusCode = 404;
        throw error;
    }

    return product;
};

export const remove = async (
    productId
) => {
    const product =
        await deleteProductById(
            productId
        );

    if (!product) {
        const error = new Error(
            "Product not found"
        );
        error.statusCode = 404;
        throw error;
    }

    return product;
};