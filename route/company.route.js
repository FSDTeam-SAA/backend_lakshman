import express from "express";
import {
  createDispatcher,
  createDriver,
  deleteDispatcher,
  deleteDriver,
  getDispatcherById,
  getDispatchers,
  getDriverById,
  getDrivers,
  updateDispatcher,
  updateDriver,
  allCompany,
  getDashboardData
} from "../controller/company.controller.js";
import { protect, isCompany } from "../middleware/auth.middleware.js";
import upload from "../middleware/multer.middleware.js";

const router = express.Router();
router.use(protect, isCompany);

router.post("/create-driver", upload.single("avatar"), createDriver);
router.get("/driver", getDrivers);
router.get("/dashboard", getDashboardData);
router.get("/all-company", allCompany);
router.get("/driver/:driverId", getDriverById);
router.patch("/driver/:driverId", upload.single("avatar"), updateDriver);
router.delete("/driver/:driverId", deleteDriver);

router.post("/create-dispacher", createDispatcher);
router.get("/dispacher", getDispatchers);
router.get("/dispacher/:dispatcherId", getDispatcherById);
router.patch("/dispacher/:dispatcherId", updateDispatcher);
router.delete("/dispacher/:dispatcherId", deleteDispatcher);

export default router;
