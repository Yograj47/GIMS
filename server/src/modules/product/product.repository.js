import Product from "./product.model.js";

export const findProductById = async (id) => {
    return Product.findById(id);
};

export const findProductByName = async (name) => {
    return Product.findOne({ name });
};

export const createProduct = async (payload) => {
    return Product.create(payload);
};

export const updateProductById = async (
    id,
    payload
) => {
    return Product.findByIdAndUpdate(
        id,
        payload,
        {
            new: true,
            runValidators: true,
        }
    );
};

export const deleteProductById = async (
    id
) => {
    return Product.findByIdAndDelete(id);
};

export const findProducts = async (
    query,
    {
        page = 1,
        limit = 10,
        paginate = true,
    } = {}
) => {
    let itemsQuery = Product.find(query)
        .sort({ createdAt: -1 });

    if (paginate) {
        itemsQuery = itemsQuery
            .skip((page - 1) * limit)
            .limit(limit);
    }

    const [items, totalItems] =
        await Promise.all([
            itemsQuery,
            Product.countDocuments(query),
        ]);

    return {
        items,
        totalItems,
    };
};

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

export const countProductsByUnit = async (
    unitId
) => {
    return Product.countDocuments({
        unitId,
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
