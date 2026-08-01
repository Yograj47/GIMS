import Movement from "./movement.model.js";

export const createMovement = async (
    payload
) => {
    return Movement.create(payload);
};

export const findMovementById = async (
    movementId
) => {
    return Movement.findById(
        movementId
    );
};

export const findMovements = async (
    query = {},
    {
        page = 1,
        limit = 100,
        paginate = true,
    } = {}
) => {
    let itemsQuery = Movement.find(
        query
    )
        .populate(
            "productId",
            "name"
        )
        .populate(
            "performedBy",
            "name email"
        )
        .sort({
            createdAt: -1,
        });

    if (paginate) {
        itemsQuery = itemsQuery
            .skip(
                (page - 1) * limit
            )
            .limit(limit);
    }

    const [items, totalItems] =
        await Promise.all([
            itemsQuery,
            Movement.countDocuments(
                query
            ),
        ]);

    return {
        items,
        totalItems,
    };
};

export const findMovementsByProductId =
    async (productId) => {
        return Movement.find({
            productId,
        }).sort({
            createdAt: -1,
        });
    };

export const findMovementsByTransactionId =
    async (
        transactionId
    ) => {
        return Movement.find({
            transactionId,
        }).sort({
            createdAt: -1,
        });
    };