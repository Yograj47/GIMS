import GeneralSettings from "../models/GeneralSettings.Model.js";
import asyncHandler from "express-async-handler";

/**
 * @desc    Get general settings
 * @route   GET /api/v1/settings/general
 * @access  Private
 */
export const getGeneralSettings = asyncHandler(async (req, res) => {
    let settings = await GeneralSettings.findOne({});

    if (!settings) {
        settings = await GeneralSettings.create({});
    }

    res.status(200).json({
        status: "Success",
        data: settings
    });
});

/**
 * @desc    Update general settings (Singleton)
 * @route   PUT /api/v1/settings/general
 * @access  Private
 */
export const updateGeneralSettings = asyncHandler(async (req, res) => {
    const settings = await GeneralSettings.findOneAndUpdate(
        {},
        { $set: req.body },
        {
            new: true,
            upsert: true,
            runValidators: true,
            setDefaultsOnInsert: true
        }
    );

    res.status(200).json({
        status: "Success",
        message: "Settings updated successfully",
        data: settings
    });
});