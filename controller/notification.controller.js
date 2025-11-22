import httpStatus from "http-status";
import { Notification } from "../model/notification.model.js";
import sendResponse from "../utils/sendResponse.js";
import catchAsync from "../utils/catchAsync.js";
import { User } from "../model/user.model.js";
import { Company } from "../model/company.model.js";
import { Dispatcher } from "../model/dispatcher.model.js";

export const getUserNotifications = catchAsync(async (req, res) => {
  let notifications

  notifications = await Notification.find({ user: req.user._id }).sort({
    createdAt: -1,
  });
  if (req.user.role === "dispatcher") {
    let com = await Dispatcher.findOne({ user: req.user._id }).populate("company")
    notifications = await Notification.find({
      $or: [
        { user: req.user._id },
        { user: com.company.owner }
      ]
    }).sort({ createdAt: -1 });

  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Notifications fetched successfully",
    data: notifications,
  });
});

export const markNotificationAsRead = catchAsync(async (req, res) => {
  const { id } = req.params;
  const notification = await Notification.findByIdAndUpdate(
    id,
    { read: true },
    { new: true }
  );

  if (!notification) {
    throw new AppError(httpStatus.NOT_FOUND, "Notification not found");
  }

  const updatedNotification = await notification.save();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Notification marked as read successfully",
    data: updatedNotification,
  });
});

export const markAllNotificationsAsRead = catchAsync(async (req, res) => {
  await Notification.updateMany(
    { user: req.user._id, read: false },
    { read: true }
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All notifications marked as read successfully",
  });
});

export const toggleNotificationsOnOff = catchAsync(async (req, res) => {
  const { enable } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (enable === "true") {
    user.enableNotifications = true;
  } else {
    user.enableNotifications = false;
  }

  await user.save();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Notifications updated successfully",
  });
});
