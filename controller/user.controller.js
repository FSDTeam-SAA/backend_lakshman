import httpStatus from "http-status";
import { User } from "../model/user.model.js";
import { uploadOnCloudinary } from "../utils/commonMethod.js";
import AppError from "../errors/AppError.js";
import sendResponse from "../utils/sendResponse.js";
import catchAsync from "../utils/catchAsync.js";
import { Company } from "../model/company.model.js";
import { Dispatcher } from "../model/dispatcher.model.js";
import { Driver } from "../model/driver.model.js";

const pickAllowedFields = (obj, allowedFields) => {
  const filtered = {};
  Object.keys(obj).forEach((key) => {
    if (allowedFields.includes(key)) {
      filtered[key] = obj[key];
    }
  });
  return filtered;
};

export const getProfile = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { role } = req.user;

  let profile = null;

  switch (role) {
    case "user":
      profile = await User.findById(userId).select("-password -refreshToken");
      break;

    case "company":
      profile = await Company.findOne({ owner: userId }).populate(
        "owner",
        "-password -refreshToken"
      );
      break;

    case "dispatcher":
      profile = await Dispatcher.findOne({ user: userId })
        .populate("user", "-password -refreshToken")
        .populate("company", "name email logo");
      break;

    case "driver":
      profile = await Driver.findOne({ user: userId })
        .populate("user", "-password -refreshToken")
        .populate("company", "name email logo");
      break;

    case "admin":
      profile = await Admin.findById(userId).populate(
        "user",
        "-password -refreshToken"
      );
      break;

    default:
      return next(new AppError(400, "Invalid role"));
  }

  if (!profile) {
    throw new AppError(404, "Profile not found");
  }

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Profile retrieved successfully",
    data: profile,
  });
});

export const updateProfile = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { role } = req.user;

  console.log("updateProfile" , req.body);

  let allowedFields = [];
  let imageField = null;

  switch (role) {
    case "user":
      allowedFields = [
        "name",
        "email",
        "phone",
        "address",
        "dob",
        "nationality",
      ];
      imageField = "avatar";
      break;

    case "company":
      allowedFields = [
        "name",
        "email",
        "uniqueCode",
        "information",
        "category",
      ];
      imageField = "logo";
      break;

    case "dispatcher":
      allowedFields = ["address"];
      imageField = "avatar";
      break;

    case "driver":
      allowedFields = ["address", "drivingLicense"];
      imageField = "avatar";
      break;

    case "admin":
      allowedFields = ["name", "email"];
      imageField = "avatar";
      break;

    default:
      return next(new AppError(httpStatus.BAD_REQUEST, "Invalid role"));
  }

  const updates = pickAllowedFields(req.body, allowedFields);

  if (req.file) {
    const image = await uploadOnCloudinary(req.file.buffer);
    if (!image) {
      throw new AppError(httpStatus.BAD_REQUEST, "Image upload failed");
    }
    updates[imageField] = image.secure_url;
  }

  let updatedUser = null;

  switch (role) {
    case "user":
      updatedUser = await User.findByIdAndUpdate(userId, updates, {
        new: true,
        runValidators: true,
      }).select("-password");
      break;

    case "company":
      updatedUser = await Company.findOneAndUpdate({ owner: userId }, updates, {
        new: true,
        runValidators: true,
      }).populate("owner", "name email profileImage");
      break;

    case "dispatcher":
      updatedUser = await Dispatcher.findOneAndUpdate(
        { user: userId },
        updates,
        {
          new: true,
          runValidators: true,
        }
      ).populate("user", "name email profileImage");
      break;

    case "driver":
      updatedUser = await Driver.findOneAndUpdate({ user: userId }, updates, {
        new: true,
        runValidators: true,
      }).populate("user", "name email profileImage");
      break;

    case "admin":
      updatedUser = await User.findByIdAndUpdate(userId, updates, {
        new: true,
        runValidators: true,
      });
      break;
  }

  if (!updatedUser) {
    throw new AppError(httpStatus.NOT_FOUND, "Profile not found");
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile updated successfully",
    data: updatedUser,
  });
});

// Change user password
export const changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  const user = await User.findById(req.user._id).select("+password");
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (newPassword !== confirmPassword) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "New password and confirm password do not match"
    );
  }

  if (!(await User.isPasswordMatched(currentPassword, user.password))) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Current password is incorrect"
    );
  }

  user.password = newPassword;
  await user.save();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Password changed successfully",
    data: user,
  });
});
