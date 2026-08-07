import {
    findMovementById,
    findMovements,
} from "./movement.repository.js";

import {
    AppError,
} from "../../shared/errors/index.js";

export const find = async ({
    page = 1,
    limit = 100,
    paginate = true,
    productId,
    movementType,
}) => {
    const query = {};

    if (productId) {
        query.productId = productId;
    }

    if (movementType) {
        query.movementType = movementType;
    }

    const {
        items,
        totalItems,
    } = await findMovements(query, {
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
    movementId
) => {
    const movement =
        await findMovementById(
            movementId
        );

    if (!movement) {
        throw AppError.notFound(
            "Movement not found"
        );
    }

    return movement;
};