import mongoose from "mongoose";

const dispatcherSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    avatar: { type: String },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
    address: { type: String },
  },
  { timestamps: true }
);

export const Dispatcher = mongoose.model("Dispatcher", dispatcherSchema);
