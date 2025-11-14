import express from "express";
import {
  addSubscriptionPlan,
  getSubscriptionPlansAdmin,
  updateSubscriptionPlan,
  toggleSubscriptionPlan,
  deleteSubscriptionPlan,
} from "../controller/plan.controller.js";

const router = express.Router();

router.post("/", addSubscriptionPlan);
router.get("/", getSubscriptionPlansAdmin);
router.put("/:id", updateSubscriptionPlan);
router.patch("/:id/toggle", toggleSubscriptionPlan);
router.delete("/:id", deleteSubscriptionPlan);

export default router;
