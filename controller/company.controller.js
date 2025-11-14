import { Driver } from "../model/driver.model.js";
import { Dispatcher } from "../model/dispatcher.model.js";
import { User } from "../model/user.model.js";
import httpStatus from "http-status";
import AppError from "../errors/AppError.js";
import sendResponse from "../utils/sendResponse.js";
import catchAsync from "../utils/catchAsync.js";
import bcrypt from "bcryptjs";
import { isValidObjectId } from "mongoose";
import { uploadOnCloudinary } from "../utils/commonMethod.js";

// Default password
const DEFAULT_DRIVER_PASSWORD = process.env.DEFAULT_PASSWORD || "Driver@123";
const DEFAULT_DISPATCHER_PASSWORD =
  process.env.DEFAULT_PASSWORD || "Dispatcher@123";

// Create Driver
export const createDriver = catchAsync(async (req, res) => {
  const { name, email, phone, company } = req.body;

  if (!isValidObjectId(company)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid company ID");
  }

  const image = null
  // req.file ? await uploadOnCloudinary(req.file.buffer) : null;
  // if (!image) {
  //   throw new AppError(httpStatus.BAD_REQUEST, "Image upload failed");
  // }

  const imageUrl = image ? image.secure_url : null;

  // Create user first
  // const hashedPassword = await bcrypt.hash(DEFAULT_DRIVER_PASSWORD, 10);
  const user = await User.create({
    name,
    email,
    phone,
    role: "driver",
    password: DEFAULT_DRIVER_PASSWORD,
    verificationInfo: { token: "", verified: true },
  });

  const driver = await Driver.create({
    user: user._id,
    company,
    drivingLicense: imageUrl,
  });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Driver created successfully",
    data: driver,
  });
});

// Get all drivers
export const getDrivers = catchAsync(async (req, res) => {
  const drivers = await Driver.find().populate("user company");

  if (!drivers || drivers.length === 0) {
    throw new AppError(httpStatus.NOT_FOUND, "No drivers found");
  }
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Drivers retrieved successfully",
    data: drivers,
  });
});

// Get single driver
export const getDriverById = catchAsync(async (req, res) => {
  const { driverId } = req.params;
  if (!isValidObjectId(driverId)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid driver ID");
  }
  const driver = await Driver.findById(driverId).populate("user company");

  if (!driver) throw new AppError(httpStatus.NOT_FOUND, "Driver not found");

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Driver retrieved successfully",
    data: driver,
  });
});

// Update driver
export const updateDriver = catchAsync(async (req, res) => {
  const { driverId } = req.params;
  const { name, email, phone } = req.body;

  if (!isValidObjectId(driverId)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid driver ID");
  }

  const driver = await Driver.findById(driverId);
  if (!driver) throw new AppError(httpStatus.NOT_FOUND, "Driver not found");

  const image = req.file ? await uploadOnCloudinary(req.file.buffer) : null;

  if (!image) {
    throw new AppError(httpStatus.BAD_REQUEST, "Image upload failed");
  }

  const imageUrl = image ? image.secure_url : null;

  // Update User fields if provided
  const user = await User.findById(driver.user);

  if (name) user.name = name;
  if (email) user.email = email;
  if (phone) user.phone = phone;

  await user.save();

  // Update Driver fields
  if (imageUrl) driver.drivingLicense = imageUrl;

  await driver.save();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Driver updated successfully",
    data: driver,
  });
});

// Delete driver
export const deleteDriver = catchAsync(async (req, res) => {
  const { driverId } = req.params;

  const driver = await Driver.findById(driverId);

  if (!driver) throw new AppError(httpStatus.NOT_FOUND, "Driver not found");

  // Delete related user
  await User.findByIdAndDelete(driver.user);
  await driver.remove();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Driver deleted successfully",
    data: null,
  });
});

// Create Dispatcher
export const createDispatcher = catchAsync(async (req, res) => {
  const { name, email, phone, company } = req.body;

  if (!isValidObjectId(company)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid company ID");
  }

  // Check if user already exists with this email
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "User with this email already exists"
    );
  }

  // Create user first
  // const hashedPassword = await bcrypt.hash(DEFAULT_DISPATCHER_PASSWORD, 10);
  const user = await User.create({
    name,
    email,
    phone,
    role: "dispatcher",
    password: DEFAULT_DISPATCHER_PASSWORD,
    verificationInfo: { token: "", verified: true },
  });

  const dispatcher = await Dispatcher.create({
    user: user._id,
    company,
  });

  // Populate the created dispatcher
  const populatedDispatcher = await Dispatcher.findById(
    dispatcher._id
  ).populate("user company");

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Dispatcher created successfully",
    data: populatedDispatcher,
  });
});

// Get all dispatchers
export const getDispatchers = catchAsync(async (req, res) => {
  const dispatchers = await Dispatcher.find().populate("user company");

  if (!dispatchers || dispatchers.length === 0) {
    throw new AppError(httpStatus.NOT_FOUND, "No dispatchers found");
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Dispatchers retrieved successfully",
    data: dispatchers,
  });
});

// Get single dispatcher
export const getDispatcherById = catchAsync(async (req, res) => {
  const { dispatcherId } = req.params;

  if (!isValidObjectId(dispatcherId)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid dispatcher ID");
  }

  const dispatcher = await Dispatcher.findById(dispatcherId).populate(
    "user company"
  );

  if (!dispatcher) {
    throw new AppError(httpStatus.NOT_FOUND, "Dispatcher not found");
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Dispatcher retrieved successfully",
    data: dispatcher,
  });
});

// Update dispatcher
export const updateDispatcher = catchAsync(async (req, res) => {
  const { dispatcherId } = req.params;
  const { name, email, phone, company } = req.body;

  if (!isValidObjectId(dispatcherId)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid dispatcher ID");
  }

  const dispatcher = await Dispatcher.findById(dispatcherId);
  if (!dispatcher) {
    throw new AppError(httpStatus.NOT_FOUND, "Dispatcher not found");
  }

  // Update User fields if provided
  const user = await User.findById(dispatcher.user);

  if (name) user.name = name;
  if (email) user.email = email;
  if (phone) user.phone = phone;

  await user.save();

  // Update Dispatcher fields
  if (company) dispatcher.company = company;

  await dispatcher.save();

  // Get updated dispatcher with populated data
  const updatedDispatcher = await Dispatcher.findById(dispatcherId).populate(
    "user company"
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Dispatcher updated successfully",
    data: updatedDispatcher,
  });
});

// Delete dispatcher
export const deleteDispatcher = catchAsync(async (req, res) => {
  const { dispatcherId } = req.params;

  if (!isValidObjectId(dispatcherId)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid dispatcher ID");
  }

  const dispatcher = await Dispatcher.findById(dispatcherId);
  if (!dispatcher) {
    throw new AppError(httpStatus.NOT_FOUND, "Dispatcher not found");
  }

  // Delete related user
  await User.findByIdAndDelete(dispatcher.user);
  await Dispatcher.findByIdAndDelete(dispatcher);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Dispatcher deleted successfully",
    data: null,
  });
});
