import mongoose from "mongoose";
import { AppError } from "../../shared/errors/index.js";
import Product from "../product/product.model.js";
import { GoodsReceipt, SupplierProduct } from "../receiving/receiving.model.js";

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
    removeSupplierFromProduct,
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

    const links = await SupplierProduct.find({ supplierId: id }).lean();
    const products = await Product.find({
        $or: [
            { _id: { $in: links.filter((link) => link.isActive).map((link) => link.productId) } },
            { supplierId: id, _id: { $nin: links.map((link) => link.productId) } },
        ],
    }).select("name basePrice sellingPrice quantity").lean();

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

    const ids = [...new Set(productIds.map((id) => id.toLowerCase()))];
    if (await Product.countDocuments({ _id: { $in: ids } }) !== ids.length) {
        throw AppError.notFound("One or more products were not found");
    }
    await SupplierProduct.init();
    return mongoose.connection.transaction(async (session) => {
        const result = await SupplierProduct.bulkWrite(ids.map((productId) => ({
            updateOne: {
                filter: { supplierId, productId },
                update: { $set: { isActive: true } },
                upsert: true,
            },
        })), { session });
        return { modifiedCount: result.modifiedCount + result.upsertedCount };
    });
};

export async function unlinkCatalogProduct(supplierId, productId) {
    const supplier = await findSupplierById(supplierId);
    if (!supplier || !await Product.exists({ _id: productId })) {
        throw AppError.notFound("Supplier or product not found");
    }
    await SupplierProduct.init();
    await SupplierProduct.updateOne(
        { supplierId, productId },
        { $set: { isActive: false } },
        { upsert: true },
    );
}

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

    if (await GoodsReceipt.exists({ supplierId: id }) || await SupplierProduct.exists({ supplierId: id, isActive: true })) {
        throw AppError.conflict("Deactivate this supplier to preserve receipt and catalog records");
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
