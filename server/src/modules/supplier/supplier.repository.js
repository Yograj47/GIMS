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

export const findSuppliers = async (
    query = {},
    options = {}
) => {
    return Supplier.find(query, null, options);
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