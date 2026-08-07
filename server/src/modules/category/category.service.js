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
        throw AppError.conflict(
            "Category name already exists"
        );
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
        throw AppError.notFound(
            "Category not found"
        );
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
            existingCategory._id.toString() !== categoryId.toString()
        ) {
            throw AppError.conflict(
                "Category name already exists"
            );
        }
    }

    const category =
        await updateCategoryById(
            categoryId,
            payload
        );

    if (!category) {
        throw AppError.notFound(
            "Category not found"
        );
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
        throw AppError.badRequest(
            `Cannot delete category. There are ${productCount} products assigned to it.`
        );
    }

    const category =
        await deleteCategoryById(categoryId);

    if (!category) {
        throw AppError.notFound(
            "Category not found"
        );
    }

    return category;
};