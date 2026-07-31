import User from "./user.model.js";

export const findUserByEmail = async (email) => {
    return User.findOne({ email });
};

export const findUserById = async (id) => {
    return User.findById(id);
};

export const createUser = async (payload) => {
    return User.create(payload);
};

export const updateUserById = async (id, payload) => {
    return User.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    });
};

export const deleteUserById = async (id) => {
    return User.findByIdAndDelete(id);
};