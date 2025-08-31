import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String },
    uniqueCode: { type: String },
    logo: { type: String },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    information: { type: String },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
  },
  { timestamps: true }
);

export const Company = mongoose.model("Company", companySchema);
