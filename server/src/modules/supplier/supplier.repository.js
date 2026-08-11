import Supplier from "./supplier.model.js";

export const findSupplierByEmail = async (
    email
) => {
    return Supplier.findOne({ email });
};

export const findSupplierById = async (
    id
) => {
    return Supplier.findById(id);
};

export const findSupplierByName = async (
    name
) => {
    return Supplier.findOne({ name });
};

export const findSuppliers = async (
    query,
    {
        page = 1,
        limit = 10,
        paginate = true,
    } = {}
) => {
    let itemsQuery = Supplier.find(query)
        .sort({ createdAt: -1 });

    if (paginate) {
        itemsQuery = itemsQuery
            .skip((page - 1) * limit)
            .limit(limit);
    }

    const [suppliers, totalItems] =
        await Promise.all([
            itemsQuery,
            Supplier.countDocuments(query),
        ]);

    return {
        suppliers,
        totalItems,
    };
};

export const createSupplier = async (
    payload
) => {
    return Supplier.create(payload);
};

export const updateSupplierById = async (
    id,
    payload
) => {
    return Supplier.findByIdAndUpdate(
        id,
        payload,
        {
            new: true,
            runValidators: true,
        }
    );
};

export const deleteSupplierById = async (
    id
) => {
    return Supplier.findByIdAndDelete(id);
};

export const countSuppliers = async (
    query = {}
) => {
    return Supplier.countDocuments(query);
};