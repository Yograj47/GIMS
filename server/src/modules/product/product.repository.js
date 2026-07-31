import Product from "./product.model.js";

export const countProductsByCategory = async (
    categoryId
) => {
    return Product.countDocuments({
        categoryId,
    });
};