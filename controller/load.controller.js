import catchAsync from "../utils/catchAsync.js";
import { Load } from "../model/load.model.js";
import { Company } from "../model/company.model.js"; // Assuming you have the company model
import sendResponse from "../utils/sendResponse.js";
import AppError from "../errors/AppError.js";

export const createLoad = catchAsync(async (req, res, next) => {
  const {
    title,
    description,
    category,
    pickupLocation,
    deliveryLocation,
    companyToken = "default",
    pickupDate,
    note,
  } = req.body;

  if (
    !title ||
    !description ||
    !category ||
    !pickupLocation ||
    !deliveryLocation
  ) {
    throw new AppError(400, "Please provide all required fields");
  }

  let company;

  if (companyToken === "default") {
    company = await Company.findOne({ isDefault: true });

    if (!company) {
      throw new AppError(404, "default company not found");
    }
  } else {
    company = await Company.findById(companyToken);

    if (!company) {
      throw new AppError(404, "Company not found");
    }
  }

  // Create a new load record
  const newLoad = await Load.create({
    title,
    description,
    category,
    pickupLocation,
    deliveryLocation,
    companyToken: company._id,
    loadBy: req.user._id,
    pickupDate,
    note,
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Load created successfully",
    data: newLoad,
  });
});

export const askPriceController = catchAsync(async (req, res) => {
  const { loadId } = req.params;
  const { askPrice } = req.body;

  const load = await Load.findById(loadId);
  if (!load) {
    throw new AppError(httpStatus.NOT_FOUND, "Load not found");
  }

  load.askPrice = askPrice;
  load.orderStatus = "asked";
  await load.save();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Price asked successfully",
    data: load,
  });
});

export const acceptRejectPriceController = catchAsync(async (req, res) => {
  const { loadId } = req.params;
  const { action } = req.body;

  if (!["accepted", "rejected"].includes(action)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Invalid action. Must be 'accepted' or 'rejected'"
    );
  }

  const load = await Load.findById(loadId);
  if (!load) {
    throw new AppError(httpStatus.NOT_FOUND, "Load not found");
  }

  load.orderStatus = action;
  await load.save();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Price ${action} successfully`,
    data: load,
  });
});

export const assignDriverController = catchAsync(async (req, res) => {
  const { loadId } = req.params;
  const { driverId } = req.body;

  const load = await Load.findById(loadId);
  if (!load) {
    throw new AppError(httpStatus.NOT_FOUND, "Load not found");
  }

  load.driver = driverId;
  load.orderStatus = "driver_pending";
  await load.save();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Driver assigned successfully",
    data: load,
  });
});
