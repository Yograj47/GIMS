import {
    findMovementById,
    findMovements,
} from "./movement.repository.js";

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
    } = await findMovements(
        query,
        {
            page,
            limit,
            paginate,
        }
    );

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
        const error =
            new Error(
                "Movement not found"
            );

        error.statusCode = 404;

        throw error;
    }

    return movement;
};