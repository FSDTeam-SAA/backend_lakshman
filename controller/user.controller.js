import httpStatus from "http-status";
import { User } from "../model/user.model.js";
import { uploadOnCloudinary } from "../utils/commonMethod.js";
import AppError from "../errors/AppError.js";
import sendResponse from "../utils/sendResponse.js";
import catchAsync from "../utils/catchAsync.js";
import { Company } from "../model/company.model.js";
import { Dispatcher } from "../model/dispatcher.model.js";
import { Driver } from "../model/driver.model.js";
import { Load } from "../model/load.model.js";

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
  let dashboard = null

  switch (role) {
    case "user":
      profile = await User.findById(userId).select("-password -refreshToken");
      break;

    case "company": {
      // 1️⃣ Get company info
      const company = await Company.findOne({ owner: userId })
        .populate("owner", "-password -refreshToken");

      if (!company) throw new AppError(404, "Company not found");

      const companyId = company._id;

      // 2️⃣ Dashboard calculations
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Today's delivered loads
      const todaysDelivered = await Load.find({
        companyToken: companyId,
        orderStatus: "delivered",
        createdAt: { $gte: today },
      });

      const todaysDelivery = todaysDelivered.length;
      const todaysEarnings = todaysDelivered.reduce(
        (sum, load) => sum + (load.askPrice || 0),
        0
      );

      // Active drivers (if you have Driver model)
      const activeDrivers = await Driver.countDocuments({
        company: companyId,
      });

      // Running loads
      const runningStatuses = [
        "pending",
        "processing",
        "pickup",
        "on_the_way",
        "driver_pending",
      ];
      const runningLoads = await Load.countDocuments({
        companyToken: companyId,
        orderStatus: { $in: runningStatuses },
      });

      // Weekly revenue
      const last7Days = new Date();
      last7Days.setDate(today.getDate() - 6);
      console.log(last7Days);

      const weeklyRevenue = await Load.aggregate([
        {
          $match: {
            companyToken: companyId,
            orderStatus: "delivered",
            createdAt: { $gte: last7Days },
          },
        },
        {
          $group: {
            _id: { $dayOfWeek: "$createdAt" },
            total: { $sum: "$askPrice" },
          },
        },
        { $sort: { "_id": 1 } },
      ]);
      console.log(weeklyRevenue);

      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const revenue = weeklyRevenue.map((r) => ({
        day: dayNames[r._id - 1],
        value: r.total,
      }));

      dashboard = {
        todaysDelivery,
        todaysEarnings,
        activeDrivers,
        runningLoads,
        revenue,
      };

      profile = { ...company.toObject(), dashboard };
      break;
    }

    case "dispatcher":
      const dispatcher = await Dispatcher.findOne({ user: userId })
        .populate("user", "-password -refreshToken")
        .populate("company", "name email logo");

      if (!dispatcher) throw new AppError(404, "Dispatcher not found");

      const companyId = dispatcher.company?._id;

      // Dashboard stats
      const pendingRequests = await Load.countDocuments({
        companyToken: companyId,
        orderStatus: "pending",
      });

      const readyToLoad = await Load.countDocuments({
        companyToken: companyId,
        orderStatus: { $in: ["processing", "pickup"] },
      });

      const availableDrivers = await Driver.countDocuments({
        company: companyId,
      });

      dashboard = {
        pendingRequests,
        readyToLoad,
        availableDrivers,
      };

      profile = { ...dispatcher.toObject(), dashboard };
      break;

        case "driver":
      const driver = await Driver.findOne({ user: userId })
        .populate("user", "-password -refreshToken")
        .populate("company", "name email logo");

      if (!driver) throw new AppError(404, "Driver not found");

      // All loads assigned to this driver
      const assignedLoads = await Load.find({ driver: userId }).sort({
        createdAt: -1,
      });

      // Current active load (not yet delivered)
      const currentLoad = await Load.findOne({
        driver: userId,
        orderStatus: { $nin: ["delivered", "driver_delivered"] },
      }).sort({ createdAt: -1 });

      dashboard = {
        totalAssigned: assignedLoads.length,
        currentLoad,
        recentLoads: assignedLoads,
      };

      profile = { ...driver.toObject(), dashboard };
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
