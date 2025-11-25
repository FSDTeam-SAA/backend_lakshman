import { Category } from "../model/category.model.js";
import AppError from "../errors/AppError.js";
import httpStatus from "http-status";
import sendResponse from "../utils/sendResponse.js";
import { uploadOnCloudinary } from "./../utils/commonMethod.js";
import catchAsync from "../utils/catchAsync.js";

export const createCategory = catchAsync(async (req, res) => {
  const { name } = req.body;

  if (!name) {
    throw new AppError(httpStatus.BAD_REQUEST, "Please provide the name");
  }

  if (req.file) {
    const image = await uploadOnCloudinary(req.file.buffer);
    if (image) {
    }
  }

  const category = await Category.create({
    name,
  });

  if (req.file) {
    const image = await uploadOnCloudinary(req.file.buffer);
    if (image) {
      category.image = {
        public_id: image.public_id,
        url: image.secure_url,
      };
      await category.save();
    }
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Category created successfully",
    data: category,
  });
});

export const getAllCategories = catchAsync(async (req, res) => {
  const categories = await Category.find().sort({ createdAt: -1 });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Categories retrieved successfully",
    data: categories,
  });
});

export const getCategoryById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const category = await Category.findById(id);
  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, "Category not found");
  }
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Category retrieved successfully",
    data: category,
  });
});

export const deleteCategoryById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const category = await Category.findByIdAndDelete(id);
  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, "Category not found");
  }
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Category deleted successfully",
    data: null,
  });
});
