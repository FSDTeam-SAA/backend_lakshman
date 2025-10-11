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
} from "../controller/company.controller.js";
import { protect, isCompany } from "../middleware/auth.middleware.js";
import upload from "../middleware/multer.middleware.js";

const router = express.Router();
router.use(protect, isCompany);

router.post("/", upload.single("avatar"), createDriver);
router.get("/", getDrivers);
router.get("/:driverId", getDriverById);
router.patch("/:driverId", upload.single("avatar"), updateDriver);
router.delete("/:driverId", deleteDriver);

router.post("/", createDispatcher);
router.get("/", getDispatchers);
router.get("/:dispatcherId", getDispatcherById);
router.patch("/:dispatcherId", updateDispatcher);
router.delete("/:dispatcherId", deleteDispatcher);

export default router;
