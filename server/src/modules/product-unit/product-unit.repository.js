import ProductUnit from "./product-unit.model.js";

export const findProductUnits = async (
    filter = {}
) => {
    return ProductUnit.find(filter);
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