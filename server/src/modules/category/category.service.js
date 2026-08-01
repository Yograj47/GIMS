import Product from "../product/product.model.js";
import {
    findCategoryById,
    findCategoryByName,
    createCategory,
    updateCategoryById,
    deleteCategoryById,
    findCategories,
} from "./category.repository.js";
import { countProductsByCategory }
    from "../product/product.repository.js";

export const create = async (
    payload
) => {
    const existingCategory =
        await findCategoryByName(payload.name);

    if (existingCategory) {
        const error = new Error(
            "Category name already exists"
        );
        error.statusCode = 409;
        throw error;
    }

    return createCategory(payload);
};

export const find = async ({
    page = 1,
    limit = 100,
    search = "",
    paginate = true,
}) => {
    const query = {
        $or: [
            {
                name: {
                    $regex: search,
                    $options: "i",
                },
            },
        ],
    };

    const { items, totalItems } =
        await findCategories(query, {
            page,
            limit,
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

export const findById = async (
    categoryId
) => {
    const category =
        await findCategoryById(categoryId);

    if (!category) {
        const error = new Error(
            "Category not found"
        );
        error.statusCode = 404;
        throw error;
    }

    return category;
};

export const update = async (
    categoryId,
    payload
) => {
    if (payload.name) {
        const existingCategory =
            await findCategoryByName(
                payload.name
            );

        if (
            existingCategory &&
            existingCategory._id.toString() !==
            categoryId.toString()
        ) {
            const error = new Error(
                "Category name already exists"
            );
            error.statusCode = 409;
            throw error;
        }
    }

    const category =
        await updateCategoryById(
            categoryId,
            payload
        );

    if (!category) {
        const error = new Error(
            "Category not found"
        );
        error.statusCode = 404;
        throw error;
    }

    return category;
};

export const remove = async (
    categoryId
) => {
    const productCount =
        await countProductsByCategory(
            categoryId
        );

    if (productCount > 0) {
        const error = new Error(
            `Cannot delete category. There are ${productCount} products assigned to it.`
        );
        error.statusCode = 400;
        throw error;
    }

    const category =
        await deleteCategoryById(categoryId);

    if (!category) {
        const error = new Error(
            "Category not found"
        );
        error.statusCode = 404;
        throw error;
    }

    return category;
};