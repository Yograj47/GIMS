import {
    findSettings,
    createSettings,
    upsertSettings,
} from "./setting.repository.js";

export const find = async () => {
    let settings =
        await findSettings();

    if (!settings) {
        settings =
            await createSettings();
    }

    return settings;
};

export const update = async (
    payload
) => {
    return upsertSettings(
        payload
    );
};