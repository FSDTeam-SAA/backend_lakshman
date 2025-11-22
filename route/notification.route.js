import { Router } from "express";
import {
  getUserNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  toggleNotificationsOnOff,
} from "../controller/notification.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", protect, getUserNotifications);
router.patch("/mark-all-read", protect, markAllNotificationsAsRead);
router.patch("/mark-read/:id", protect, markNotificationAsRead);
router.patch("/toggle", protect, toggleNotificationsOnOff);

export default router;
