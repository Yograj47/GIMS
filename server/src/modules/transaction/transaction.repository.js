import Transaction from "./transaction.model.js";

export const createTransaction = async (
    payload,
    session
) => {
    return Transaction.create(
        [payload],
        { session }
    );
};

export const findTransactionById = async (
    transactionId
) => {
    return Transaction.findById(
        transactionId
    );
};

export const findTransactions = async (
    query = {},
    {
        page = 1,
        limit = 100,
        paginate = true,
    } = {}
) => {
    let itemsQuery =
        Transaction.find(query)
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
            Transaction.countDocuments(
                query
            ),
        ]);

    return {
        items,
        totalItems,
    };
};

export const updateTransactionById =
    async (
        transactionId,
        payload
    ) => {
        return Transaction.findByIdAndUpdate(
            transactionId,
            payload,
            {
                new: true,
                runValidators: true,
            }
        );
    };

export const deleteTransactionById =
    async (
        transactionId,
        session
    ) => {
        return Transaction.findByIdAndDelete(
            transactionId,
            { session }
        );
    };