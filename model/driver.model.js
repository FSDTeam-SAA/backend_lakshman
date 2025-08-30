import mongoose from "mongoose";

const driverSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    drivingLicense: { type: String, required: true },
    avatar: { type: String },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
    address: { type: String },
  },
  { timestamps: true }
);

export const Driver = mongoose.model("Driver", driverSchema);
