import mongoose from "mongoose";
import Product from "./product.model.js";

export const findProductById = async (id) => {
    const results = await Product.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(id),
            },
        },

        // Category
        {
            $lookup: {
                from: "categories",
                localField: "categoryId",
                foreignField: "_id",
                as: "categoryDoc",
            },
        },
        {
            $unwind: "$categoryDoc",
        },

        // Base unit
        {
            $lookup: {
                from: "units",
                localField: "unitId",
                foreignField: "_id",
                as: "unitDoc",
            },
        },
        {
            $unwind: "$unitDoc",
        },

        // Supplier
        {
            $lookup: {
                from: "suppliers",
                localField: "supplierId",
                foreignField: "_id",
                as: "supplierDoc",
            },
        },
        {
            $unwind: {
                path: "$supplierDoc",
                preserveNullAndEmptyArrays: true,
            },
        },

        // Selling units
        {
            $lookup: {
                from: "productunits",
                let: {
                    productId: "$_id",
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: [
                                    "$productId",
                                    "$$productId",
                                ],
                            },
                            isActive: true,
                        },
                    },

                    {
                        $lookup: {
                            from: "units",
                            localField: "unitId",
                            foreignField: "_id",
                            as: "unitDoc",
                        },
                    },

                    {
                        $unwind: "$unitDoc",
                    },

                    {
                        $project: {
                            _id: 1,
                            multiplier: 1,
                            isDefault: 1,
                            isFractionable: 1,

                            unitId: {
                                _id: "$unitDoc._id",
                                name: "$unitDoc.name",
                                shortForm:
                                    "$unitDoc.shortForm",
                                multiplierToBase:
                                    "$unitDoc.multiplierToBase",
                            },
                        },
                    },
                ],
                as: "sellingUnits",
            },
        },

        // Response shape
        {
            $project: {
                _id: 1,
                name: 1,
                quantity: 1,
                threshold: 1,
                basePrice: 1,
                sellingPrice: 1,
                isActive: 1,
                createdAt: 1,
                updatedAt: 1,

                category: {
                    _id: "$categoryDoc._id",
                    name: "$categoryDoc.name",
                },

                unit: {
                    _id: "$unitDoc._id",
                    name: "$unitDoc.name",
                    shortForm: "$unitDoc.shortForm",
                    multiplierToBase:
                        "$unitDoc.multiplierToBase",
                },

                supplier: {
                    $cond: {
                        if: {
                            $ifNull: [
                                "$supplierDoc._id",
                                false,
                            ],
                        },
                        then: {
                            _id: "$supplierDoc._id",
                            name: "$supplierDoc.name",
                        },
                        else: null,
                    },
                },

                sellingUnits: 1,

                baseUnit: {
                    $let: {
                        vars: {
                            found: {
                                $first: {
                                    $filter: {
                                        input: "$sellingUnits",
                                        cond: {
                                            $eq: [
                                                "$$this.multiplier",
                                                1,
                                            ],
                                        },
                                    },
                                },
                            },
                        },

                        in: {
                            $cond: {
                                if: {
                                    $ifNull: [
                                        "$$found",
                                        false,
                                    ],
                                },
                                then: {
                                    name: "$$found.unitId.name",
                                    shortForm:
                                        "$$found.unitId.shortForm",
                                },
                                else: null,
                            },
                        },
                    },
                },
            },
        },
    ]);

    return results[0] || null;

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
    query = {},
    {
        page = 1,
        limit = 10,
        paginate = true,
    } = {}
) => {
    const pipeline = [
        {
            $match: query,
        },

        // Category
        {
            $lookup: {
                from: "categories",
                localField: "categoryId",
                foreignField: "_id",
                as: "categoryDoc",
            },
        },
        {
            $unwind: "$categoryDoc",
        },

        // Base Unit
        {
            $lookup: {
                from: "units",
                localField: "unitId",
                foreignField: "_id",
                as: "unitDoc",
            },
        },
        {
            $unwind: "$unitDoc",
        },

        // Supplier
        {
            $lookup: {
                from: "suppliers",
                localField: "supplierId",
                foreignField: "_id",
                as: "supplierDoc",
            },
        },
        {
            $unwind: {
                path: "$supplierDoc",
                preserveNullAndEmptyArrays: true,
            },
        },

        // Selling Units
        {
            $lookup: {
                from: "productunits",
                let: {
                    productId: "$_id",
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: [
                                    "$productId",
                                    "$$productId",
                                ],
                            },
                            isActive: true,
                        },
                    },

                    {
                        $lookup: {
                            from: "units",
                            localField: "unitId",
                            foreignField: "_id",
                            as: "unitDoc",
                        },
                    },

                    {
                        $unwind: "$unitDoc",
                    },

                    {
                        $project: {
                            _id: 1,
                            multiplier: 1,
                            isDefault: 1,
                            isFractionable: 1,

                            unitId: {
                                _id: "$unitDoc._id",
                                name: "$unitDoc.name",
                                shortForm:
                                    "$unitDoc.shortForm",
                                multiplierToBase:
                                    "$unitDoc.multiplierToBase",
                            },
                        },
                    },
                ],
                as: "sellingUnits",
            },
        },

        // Final response shape
        {
            $project: {
                _id: 1,
                name: 1,
                quantity: 1,
                threshold: 1,
                basePrice: 1,
                sellingPrice: 1,
                isActive: 1,
                createdAt: 1,

                category: {
                    _id: "$categoryDoc._id",
                    name: "$categoryDoc.name",
                },

                unit: {
                    _id: "$unitDoc._id",
                    name: "$unitDoc.name",
                    shortForm: "$unitDoc.shortForm",
                    multiplierToBase:
                        "$unitDoc.multiplierToBase",
                },

                supplier: {
                    $cond: {
                        if: {
                            $ifNull: [
                                "$supplierDoc._id",
                                false,
                            ],
                        },
                        then: {
                            _id: "$supplierDoc._id",
                            name: "$supplierDoc.name",
                        },
                        else: null,
                    },
                },

                sellingUnits: 1,

                baseUnit: {
                    $let: {
                        vars: {
                            found: {
                                $first: {
                                    $filter: {
                                        input: "$sellingUnits",
                                        cond: {
                                            $eq: [
                                                "$$this.multiplier",
                                                1,
                                            ],
                                        },
                                    },
                                },
                            },
                        },

                        in: {
                            $cond: {
                                if: {
                                    $ifNull: [
                                        "$$found",
                                        false,
                                    ],
                                },

                                then: {
                                    name: "$$found.unitId.name",
                                    shortForm:
                                        "$$found.unitId.shortForm",
                                },

                                else: null,
                            },
                        },
                    },
                },
            },
        },

        {
            $sort: {
                createdAt: -1,
            },
        },
    ];

    let totalItems = 0;

    if (paginate) {
        const countResult = await Product.aggregate([
            ...pipeline,
            {
                $count: "total",
            },
        ]);

        totalItems =
            countResult[0]?.total || 0;

        pipeline.push({
            $skip: (page - 1) * limit,
        });

        pipeline.push({
            $limit: limit,
        });
    }

    const items =
        await Product.aggregate(pipeline);

    if (!paginate) {
        totalItems = items.length;
    }

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

export const updateProductQuantity = async (
    productId,
    quantity,
    session
) => {
    return Product.findByIdAndUpdate(
        productId,
        { quantity },
        {
            new: true,
            runValidators: true,
            session,
        }
    );
};