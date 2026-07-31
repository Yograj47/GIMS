import Category from "./category.model.js";

export const findCategoryById = async (id) => {
    return Category.findById(id);
};

export const findCategoryByName = async (name) => {
    return Category.findOne({ name });
};

export const createCategory = async (payload) => {
    return Category.create(payload);
};

export const updateCategoryById = async (
    id,
    payload
) => {
    return Category.findByIdAndUpdate(
        id,
        payload,
        {
            new: true,
            runValidators: true,
        }
    );
};

export const deleteCategoryById = async (id) => {
    return Category.findByIdAndDelete(id);
};

export const findCategories = async (
    query,
    options = {}
) => {
    const {
        page = 1,
        limit = 100,
        paginate = true,
    } = options;

    let categoryQuery = Category.find(query)
        .sort({ createdAt: -1 });

    if (paginate) {
        categoryQuery = categoryQuery
            .skip((page - 1) * limit)
            .limit(limit);
    }

    const [items, totalItems] =
        await Promise.all([
            categoryQuery,
            Category.countDocuments(query),
        ]);

    return {
        items,
        totalItems,
    };
};