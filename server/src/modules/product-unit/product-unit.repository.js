import ProductUnit from "./product-unit.model.js";

export const findProductUnits = async (
    {
        page = 1,
        limit = 10,
        search = "",
        paginate = true,
    }
) => {
    const pipeline = [
        {
            $lookup: {
                from: "products",
                localField: "productId",
                foreignField: "_id",
                as: "product",
            },
        },
        {
            $unwind: "$product",
        },
    ];

    if (search) {
        pipeline.push({
            $match: {
                "product.name": {
                    $regex: search,
                    $options: "i",
                },
            },
        });
    }

    pipeline.push(
        {
            $lookup: {
                from: "units",
                localField: "unitId",
                foreignField: "_id",
                as: "unit",
            },
        },
        {
            $unwind: "$unit",
        },
        {
            $group: {
                _id: "$productId",

                productName: {
                    $first: "$product.name",
                },

                conversions: {
                    $push: {
                        _id: "$_id",

                        unitName:
                            "$unit.name",

                        shortForm:
                            "$unit.shortForm",

                        multiplier:
                            "$multiplier",

                        isDefault:
                            "$isDefault",

                        isFractionable:
                            "$isFractionable",

                        isActive:
                            "$isActive",
                    },
                },
            },
        },
        {
            $sort: {
                productName: 1,
            },
        }
    );

    let totalItems = 0;

    if (paginate) {
        const countResult =
            await ProductUnit.aggregate([
                ...pipeline,
                {
                    $count: "total",
                },
            ]);

        totalItems =
            countResult[0]?.total || 0;

        pipeline.push(
            {
                $skip:
                    (page - 1) * limit,
            },
            {
                $limit: limit,
            }
        );
    }

    const items =
        await ProductUnit.aggregate(
            pipeline
        );

    return {
        items,
        totalItems,
    };
};

export const findProductUnitById = async (
    id
) => {
    return ProductUnit.findById(id);
};

export const findProductUnit = async ({
    productId,
    unitId,
}) => {
    return ProductUnit.findOne({
        productId,
        unitId,
    });
};

export const createProductUnit = async (
    payload
) => {
    return ProductUnit.create(payload);
};

export const updateProductUnitById = async (
    id,
    payload
) => {
    return ProductUnit.findByIdAndUpdate(
        id,
        payload,
        {
            new: true,
            runValidators: true,
        }
    );
};

export const deleteProductUnitById = async (
    id
) => {
    return ProductUnit.findByIdAndDelete(id);
};

export const unsetDefaultProductUnits =
    async (productId) => {
        return ProductUnit.updateMany(
            { productId },
            {
                $set: {
                    isDefault: false,
                },
            }
        );
    };