import mongoose, { Schema } from "mongoose";

const subscriptionPlanSchema = new Schema(
  {
    name: {
      type: String,
      enum: ["Basic", "Premium"],
    },
    price: {
      type: Number,
    },
    features: [
      {
        type: String,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const SubscriptionPlan = mongoose.model(
  "SubscriptionPlan",
  subscriptionPlanSchema
);
