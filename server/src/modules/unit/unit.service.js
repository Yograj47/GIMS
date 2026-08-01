import {
    findUnitById,
    findUnitByName,
    findUnitByShortForm,
    createUnit,
    updateUnitById,
    getUnits,
    countUnits,
} from "./unit.repository.js";

import {
    countProductsByUnit,
} from "../product/product.repository.js";

export const create = async (
    payload
) => {
    const existingName =
        await findUnitByName(payload.name);

    if (existingName) {
        const error = new Error(
            "Unit name already exists"
        );
        error.statusCode = 409;
        throw error;
    }

    const existingShortForm =
        await findUnitByShortForm(
            payload.shortForm
        );

    if (existingShortForm) {
        const error = new Error(
            "Unit short form already exists"
        );
        error.statusCode = 409;
        throw error;
    }

    if (payload.baseUnit) {
        payload.multiplierToBase = 1;
    }

    return createUnit(payload);
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
            {
                shortForm: {
                    $regex: search,
                    $options: "i",
                },
            },
        ],
    };

    let units = await getUnits(query)
        .sort({ createdAt: -1 });

    const totalItems =
        await countUnits(query);

    if (paginate) {
        units = units.slice(
            (page - 1) * limit,
            page * limit
        );
    }

    return {
        units,
        meta: paginate
            ? {
                totalItems,
                itemsPerPage: units.length,
                currentPage: page,
                totalPages: Math.ceil(
                    totalItems / limit
                ),
            }
            : {
                totalItems,
                itemsPerPage: units.length,
                paginationDisabled: true,
            },
    };
};

export const findById = async (id) => {
    const unit = await findUnitById(id);

    if (!unit) {
        const error = new Error(
            "Unit not found"
        );
        error.statusCode = 404;
        throw error;
    }

    return unit;
};

export const update = async (
    id,
    payload
) => {
    if (payload.name) {
        const existingName =
            await findUnitByName(
                payload.name
            );

        if (
            existingName &&
            existingName._id.toString() !== id
        ) {
            const error = new Error(
                "Unit name already exists"
            );
            error.statusCode = 409;
            throw error;
        }
    }

    if (payload.shortForm) {
        const existingShortForm =
            await findUnitByShortForm(
                payload.shortForm
            );

        if (
            existingShortForm &&
            existingShortForm._id.toString() !== id
        ) {
            const error = new Error(
                "Unit short form already exists"
            );
            error.statusCode = 409;
            throw error;
        }
    }

    if (payload.baseUnit === true) {
        payload.multiplierToBase = 1;
    }

    const unit =
        await updateUnitById(
            id,
            payload
        );

    if (!unit) {
        const error = new Error(
            "Unit not found"
        );
        error.statusCode = 404;
        throw error;
    }

    return unit;
};

export const remove = async (
    id
) => {
    const productCount =
        await countProductsByUnit(id);

    if (productCount > 0) {
        const error = new Error(
            `Cannot deactivate. This unit is currently used by ${productCount} products.`
        );
        error.statusCode = 400;
        throw error;
    }

    const unit = await findUnitById(id);

    if (!unit) {
        const error = new Error(
            "Unit not found"
        );
        error.statusCode = 404;
        throw error;
    }

    return updateUnitById(id, {
        isActive: false,
    });
};