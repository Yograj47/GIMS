import Setting from "./setting.model.js";

export const findSettings = () =>
    Setting.findOne({});

export const createSettings = (payload = {}) =>
    Setting.create(payload);

export const upsertSettings = (payload) =>
    Setting.findOneAndUpdate(
        {},
        { $set: payload },
        {
            new: true,
            upsert: true,
            runValidators: true,
            setDefaultsOnInsert: true,
        }
    );