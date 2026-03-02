import express from "express";
import { authenticate } from "../middleware/authmiddleware.js";
import {
  getMyNotifications,
  markNotificationAsRead,
} from "../controllers/notificationController.js";

const router = express.Router();

router.get("/", authenticate, getMyNotifications);
router.put("/:notificationId/read", authenticate, markNotificationAsRead);

export default router;
