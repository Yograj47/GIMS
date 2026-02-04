import Alert from "../models/Alert.Model.js";
import Product from "../models/Product.Model.js";
import asyncHandler from "express-async-handler";
import {
  alertValidator,
  updateAlertValidator
} from "../validation/Alert.validation.js";


/**
 * @desc    Create new alert
 * @route   POST /api/v1/alerts
 * @access  Private / Internal
 */
export const createAlert = asyncHandler(async (req, res) => {
  const validatedData = alertValidator.parse(req.body);

  const productExists = await Product.findById(validatedData.productId);

  if (!productExists) {
    res.status(404);
    throw new Error("Product not found");
  }

  const alert = await Alert.create(validatedData);

  res.status(201).json({
    status: "success",
    data: alert
  });
});


/**
 * @desc    Get all alerts
 * @route   GET /api/v1/alerts
 * @access  Private
 */
export const getAlerts = asyncHandler(async (req, res) => {
  const alerts = await Alert.find()
    .populate("productId", "name quantity threshold")
    .sort({ createdAt: -1 })
    .select("-__v");

  res.status(200).json({
    status: "success",
    results: alerts.length,
    data: alerts
  });
});


/**
 * @desc    Resolve / Update alert
 * @route   PUT /api/v1/alerts/:id
 * @access  Private
 */
export const updateAlertById = asyncHandler(async (req, res) => {
  const validatedData = updateAlertValidator.parse(req.body);

  const updatedAlert = await Alert.findByIdAndUpdate(
    req.params.id,
    validatedData,
    { new: true, runValidators: true }
  ).select("-__v");

  if (!updatedAlert) {
    res.status(404);
    throw new Error("Alert not found");
  }

  res.status(200).json({
    status: "success",
    data: updatedAlert
  });
});
