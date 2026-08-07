import { AppError } from "../../shared/errors/index.js";

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
        throw AppError.notFound(
            "Product not found"
        );
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

    const product =
        await updateProductById(
            productId,
            payload
        );

    if (!product) {
        throw AppError.notFound(
            "Product not found"
        );
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
        throw AppError.notFound(
            "Product not found"
        );
    }

    return product;
};