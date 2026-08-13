import { AppError } from "../../shared/errors/index.js";

import {
    createSupplier,
    findSupplierById,
    findSupplierByEmail,
    findSuppliers,
    updateSupplierById,
    deleteSupplierById,
    findSupplierByName,
} from "./supplier.repository.js";

import {
    countProductsBySupplier,
    assignSupplierToProducts,
    removeSupplierFromProduct,
    getProductsBySupplier,
} from "../product/product.repository.js";

export const create = async (payload) => {
    if (payload.email) {
        const existingEmail =
            await findSupplierByEmail(payload.email);

        if (existingEmail) {
            throw AppError.conflict(
                "Supplier with this email already exists"
            );
        }
    }

    const existingName =
        await findSupplierByName(payload.name);

    if (existingName) {
        throw AppError.conflict(
            "Supplier already exists"
        );
    }

    return createSupplier(payload);
};

export const findAll = async ({
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
        suppliers,
        totalItems,
    } = await findSuppliers(query, {
        page,
        limit,
        paginate,
    });

    return {
        suppliers,
        meta: paginate
            ? {
                totalItems,
                currentPage: page,
                totalPages: Math.ceil(
                    totalItems / limit
                ),
                itemsPerPage:
                    suppliers.length,
            }
            : {
                totalItems,
                paginationDisabled: true,
            },
    };
};

export const findById = async (id) => {
    const supplier =
        await findSupplierById(id);

    if (!supplier) {
        throw AppError.notFound(
            "Supplier not found"
        );
    }

    const products =
        await getProductsBySupplier(id);

    return {
        supplier,
        products,
    };
};

export const update = async (
    id,
    payload
) => {
    if (payload.email) {
        const existingEmail =
            await findSupplierByEmail(payload.email);

        if (
            existingEmail &&
            existingEmail._id.toString() !== id
        ) {
            throw AppError.conflict(
                "Supplier with this email already exists"
            );
        }
    }

    if (payload.name) {
        const existingName =
            await findSupplierByName(payload.name);

        if (
            existingName &&
            existingName._id.toString() !== id
        ) {
            throw AppError.conflict(
                "Supplier already exists"
            );
        }
    }

    const supplier =
        await updateSupplierById(
            id,
            payload
        );

    if (!supplier) {
        throw AppError.notFound(
            "Supplier not found"
        );
    }

    return supplier;
};

export const assignProducts = async ({
    supplierId,
    productIds,
}) => {
    const supplier =
        await findSupplierById(
            supplierId
        );

    if (!supplier) {
        throw AppError.notFound(
            "Supplier not found"
        );
    }

    return assignSupplierToProducts(
        supplierId,
        productIds
    );
};

export const unassignProduct = async (
    productId
) => {
    return removeSupplierFromProduct(
        productId
    );
};

export const remove = async (id) => {
    const count =
        await countProductsBySupplier(id);

    if (count > 0) {
        throw AppError.badRequest(
            `Cannot delete supplier. ${count} products are assigned to it.`
        );
    }

    const supplier =
        await deleteSupplierById(id);

    if (!supplier) {
        throw AppError.notFound(
            "Supplier not found"
        );
    }

    return supplier;
};