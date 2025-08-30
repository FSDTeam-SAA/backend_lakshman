import catchAsync from "../utils/catchAsync.js";
import { Load } from "../model/load.model.js";
import { Company } from "../model/company.model.js"; // Assuming you have the company model
import sendResponse from "../utils/sendResponse.js";
import AppError from "../errors/AppError.js";

export const createLoad = catchAsync(async (req, res, next) => {
  const { title, description, category, pickupLocation, deliveryLocation, companyToken = "default", pickupDate, note } = req.body;

  // Check if all required fields are provided
  if (!title || !description || !category || !pickupLocation || !deliveryLocation) {
    throw new AppError( 400,"Please provide all required fields",);
  }

  let company;
  
  // If companyToken is default, fetch the default company
  if (companyToken === "default") {
    company = await Company.findOne({ isDefault: true }); // Assuming 'isDefault' flag exists for the default company

    if (!company) {
      throw new AppError(404,"default company not found");
    }
  } else {
    // If a specific companyToken is provided, check if it exists
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
    loadBy: req.user._id, // Assuming the logged-in user is in req.user
    pickupDate,
    note,
  });

//   // Send response
//   res.status(201).json({
//     status: 'success',
//     message: 'Load created successfully',
//     data: {
//       load: newLoad
//     }
//   });

  sendResponse(res,{
    statusCode: 200,
    success: true,
    message: "Load created successfully",
    data: newLoad

  })
});
