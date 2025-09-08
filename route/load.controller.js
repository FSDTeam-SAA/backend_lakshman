import express from "express";
import {
  createLoad,
  askPriceController,
  acceptRejectPriceController,
  assignDriverController,
} from "../controller/load.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.post("/", protect, createLoad);
router.patch("/:loadId/ask-price", protect, askPriceController);
router.patch("/:loadId/price-action", protect, acceptRejectPriceController);
router.patch("/:loadId/assign-driver", protect, assignDriverController);

export default router;
