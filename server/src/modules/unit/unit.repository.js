import Unit from "./unit.model.js";

export const findUnitById = async (id) => {
    return Unit.findById(id);
};

export const findUnitByName = async (name) => {
    return Unit.findOne({ name });
};

export const findUnitByShortForm = async (
    shortForm
) => {
    return Unit.findOne({ shortForm });
};

export const createUnit = async (payload) => {
    return Unit.create(payload);
};

export const updateUnitById = async (
    id,
    payload
) => {
    return Unit.findByIdAndUpdate(
        id,
        payload,
        {
            new: true,
            runValidators: true,
        }
    );
};

export const getUnits = async (
    query = {}
) => {
    return Unit.find(query);
};

export const countUnits = async (
    query = {}
) => {
    return Unit.countDocuments(query);
};