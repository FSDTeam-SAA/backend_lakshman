import mongoose from "mongoose";

const loadSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    pickupLocation: { type: String, required: true },
    deliveryLocation: { type: String, required: true },
    companyToken: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
    loadBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    askPrice: { type: Number },
    // acceptAskPrice: {
    //   type: String,
    //   enum: ["pending", "asked", "accepted", "rejected"],
    //   default: "pending",
    // },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // status: {
    //   type: String,
    //   enum: ["pending", "processing", "delivered"],
    //   default: "pending",
    // },
    // driverStatus: {
    //   type: String,
    //   enum: ["pending", "pickup", "on the way", "delivered"],
    //   default: "pending",
    // },
    orderStatus: {
      type: String,
      enum: [
        // System/order workflow
        "pending",          // order created but not confirmed
        "processing",       // being prepared/handled
        "delivered",        // order completed

        // Driver workflow
        "driver_pending",   // waiting for driver
        "pickup",           // driver picked up
        "on_the_way",       // driver en route
        "driver_delivered", // driver delivered

        // Ask price workflow
        "ask_pending",      // waiting for user to ask price
        "asked",            // price requested
        "accepted",         // price accepted
        "rejected"          // price rejected
      ],
      default: "pending",
    },
    pickupDate: { type: Date },
    note: { type: String },
  },
  { timestamps: true }
);

export const Load = mongoose.model("Load", loadSchema);
