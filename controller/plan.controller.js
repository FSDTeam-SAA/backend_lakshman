import httpStatus from "http-status";
import { SubscriptionPlan } from "../model/subcriptionPlan.model.js";
import AppError from "../errors/AppError.js";
import sendResponse from "../utils/sendResponse.js";
import catchAsync from "../utils/catchAsync.js";

export const getSubscriptionPlansAdmin = catchAsync(async (req, res) => {
  const plans = await SubscriptionPlan.find().select("-__v");
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Plans fetched successfully",
    data: plans,
  });
});

export const addSubscriptionPlan = catchAsync(async (req, res) => {
  const { name, price, features, isActive } = req.body;

  // validate required fields
  if (!name || !price) {
    throw new AppError(httpStatus.BAD_REQUEST, "Name and price are required");
  }

  const plan = await SubscriptionPlan.create({
    name,
    price,
    features,
    isActive,
  });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Plan added successfully",
    data: plan,
  });
});

export const updateSubscriptionPlan = catchAsync(async (req, res) => {
  const plan = await SubscriptionPlan.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!plan) throw new AppError(httpStatus.NOT_FOUND, "Plan not found");

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Plan updated successfully",
    data: plan,
  });
});

export const deleteSubscriptionPlan = catchAsync(async (req, res) => {
  const plan = await SubscriptionPlan.findByIdAndDelete(req.params.id);

  if (!plan) throw new AppError(httpStatus.NOT_FOUND, "Plan not found");

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Plan deleted successfully",
    data: plan,
  });
});

export const toggleSubscriptionPlan = catchAsync(async (req, res) => {
  const { isActive } = req.body; // true or false
  const plan = await SubscriptionPlan.findByIdAndUpdate(
    req.params.id,
    { isActive },
    { new: true }
  );

  if (!plan) throw new AppError(httpStatus.NOT_FOUND, "Plan not found");

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Plan marked as ${isActive ? "active" : "inactive"}`,
    data: plan,
  });
});
