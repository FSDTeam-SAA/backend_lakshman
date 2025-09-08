import express from "express";
import {
  createLoad,
  getAllLoads,
  getLoadById,
  updateLoad,
  deleteLoad,
  askPriceController,
  acceptRejectPriceController,
  assignDriverController,
} from "../controller/load.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.post("/", createLoad);
router.get("/", getAllLoads);
router.get("/:loadId", getLoadById);
router.patch("/:loadId/update", updateLoad);
router.delete("/:loadId/delete", deleteLoad);
router.patch("/:loadId/ask-price", askPriceController);
router.patch("/:loadId/price-action", acceptRejectPriceController);
router.patch("/:loadId/assign-driver", assignDriverController);

export default router;
