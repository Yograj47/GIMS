import Product from "./product.model.js";

export const countProductsByCategory = async (
    categoryId
) => {
    return Product.countDocuments({
        categoryId,
    });
};

export const countProductsBySupplier = async (
    supplierId
) => {
    return Product.countDocuments({
        supplierId,
    });
};

export const getProductsBySupplier = async (
    supplierId
) => {
    return Product.find({
        supplierId,
    }).select(
        "name basePrice sellingPrice quantity"
    );
};

export const assignSupplierToProducts = async (
    supplierId,
    productIds
) => {
    return Product.updateMany(
        {
            _id: {
                $in: productIds,
            },
        },
        {
            $set: {
                supplierId,
            },
        }
    );
};

export const removeSupplierFromProduct = async (
    productId
) => {
    return Product.findByIdAndUpdate(
        productId,
        {
            $set: {
                supplierId: null,
            },
        },
        {
            new: true,
        }
    );
};