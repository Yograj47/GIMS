import {
    createSupplier,
    findSupplierById,
    findSupplierByEmail,
    findSupplierByName,
    getSuppliers,
    updateSupplierById,
    deleteSupplierById,
} from "./supplier.repository.js";

import {
    countProductsBySupplier,
    assignSupplierToProducts,
    removeSupplierFromProduct,
    getProductsBySupplier,
} from "../product/product.repository.js";

export const createSupplier = async (payload) => {
    const existingEmail =
        payload.email &&
        await findSupplierByEmail(payload.email);

    if (existingEmail) {
        const error = new Error(
            "Supplier with this email already exists"
        );
        error.statusCode = 409;
        throw error;
    }

    const existingName = await findSupplierByName(
        payload.name
    );

    if (existingName) {
        const error = new Error(
            "Supplier already exists"
        );
        error.statusCode = 409;
        throw error;
    }

    return createSupplier(payload);
};

export const getAllSuppliers = async (query) => {
    return getSuppliers(query);
};

export const getSupplier = async (id) => {
    const supplier = await findSupplierById(id);

    if (!supplier) {
        const error = new Error("Supplier not found");
        error.statusCode = 404;
        throw error;
    }

    const products =
        await getProductsBySupplier(id);

    return {
        supplier,
        products,
    };
};

export const updateSupplier = async (
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
            const error = new Error(
                "Supplier with this email already exists"
            );
            error.statusCode = 409;
            throw error;
        }
    }

    if (payload.name) {
        const existingName =
            await findSupplierByName(payload.name);

        if (
            existingName &&
            existingName._id.toString() !== id
        ) {
            const error = new Error(
                "Supplier already exists"
            );
            error.statusCode = 409;
            throw error;
        }
    }

    const supplier =
        await updateSupplierById(id, payload);

    if (!supplier) {
        const error = new Error(
            "Supplier not found"
        );
        error.statusCode = 404;
        throw error;
    }

    return supplier;
};

export const assignProducts = async ({
    supplierId,
    productIds,
}) => {
    const supplier =
        await findSupplierById(supplierId);

    if (!supplier) {
        const error = new Error(
            "Supplier not found"
        );
        error.statusCode = 404;
        throw error;
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

export const removeSupplier = async (id) => {
    const count =
        await countProductsBySupplier(id);

    if (count > 0) {
        const error = new Error(
            `Cannot delete supplier. ${count} products are assigned to it.`
        );
        error.statusCode = 400;
        throw error;
    }

    const supplier =
        await deleteSupplierById(id);

    if (!supplier) {
        const error = new Error(
            "Supplier not found"
        );
        error.statusCode = 404;
        throw error;
    }

    return supplier;
};