import mongoose, { Schema } from "mongoose";

const notificationSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
    },
    dispatcher: {
      type: Schema.Types.ObjectId,
      ref: "Dispatcher",
    },
    driver: {
      type: Schema.Types.ObjectId,
      ref: "Driver",
    },
    title: {
      type: String,
    },
    message: {
      type: String,
    },
    type: {
      type: String,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// notificationSchema.plugin(mongoosePaginate);

export const Notification = mongoose.model("Notification", notificationSchema);
