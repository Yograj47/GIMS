import GeneralSetting from "../models/GeneralSettings.Model.js";
import asyncHandler from "express-async-handler";

export const injectSettings = asyncHandler(async (req, res, next) => {
    let settings = await GeneralSetting.findOne({});

    if (!settings) {
        settings = {
            lowStockThreshold: 10,
            currency: "NPR",
            adminEmail: "ituh007@gmail.com",
            storeName: "My Inventory",
            enableEmailNotifications: true
        };
    }
    console.log("Hello:", settings.enableEmailNotifications);

    req.settings = settings;
    next();
});