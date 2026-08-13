import { AppError } from "../../shared/errors/index.js";

import {
    findProductUnit,
    findProductUnitById,
    findProductUnits,
    createProductUnit,
    updateProductUnitById,
    deleteProductUnitById,
    unsetDefaultProductUnits,
} from "./product-unit.repository.js";

import {
    findProductById,
} from "../product/product.repository.js";

import {
    findUnitById,
} from "../unit/unit.repository.js";

export const find = async ({
    page = 1,
    limit = 10,
    search = "",
    paginate = true,
}) => {
    const {
        items,
        totalItems,
    } = await findProductUnits({
        page,
        limit,
        search,
        paginate,
    });

    return {
        items,
        totalItems,
        page,
        limit,
        paginate,
    };
};
export const create = async (
    payload
) => {
    const {
        productId,
        unitId,
        isDefault,
    } = payload;

    const product =
        await findProductById(productId);

    if (!product) {
        throw AppError.notFound(
            "Product not found"
        );
    }

    const unit =
        await findUnitById(unitId);

    if (!unit) {
        throw AppError.notFound(
            "Unit not found"
        );
    }

    const existing =
        await findProductUnit({
            productId,
            unitId,
        });

    if (existing) {
        throw AppError.conflict(
            "Product unit already exists"
        );
    }

    if (isDefault) {
        await unsetDefaultProductUnits(
            productId
        );
    }

    return createProductUnit(payload);
};

export const update = async ({
    id,
    payload,
}) => {
    const existing =
        await findProductUnitById(id);

    if (!existing) {
        throw AppError.notFound(
            "Product unit not found"
        );
    }

    if (payload.isDefault) {
        await unsetDefaultProductUnits(
            existing.productId
        );
    }

    return updateProductUnitById(
        id,
        payload
    );
};

export const remove = async (
    id
) => {
    const productUnit =
        await findProductUnitById(id);

    if (!productUnit) {
        throw AppError.notFound(
            "Product unit not found"
        );
    }

    if (productUnit.isDefault) {
        throw AppError.badRequest(
            "Cannot delete default unit"
        );
    }

    return deleteProductUnitById(id);
};