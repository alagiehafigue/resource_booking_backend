import express from "express";
import { authenticate } from "../middleware/authmiddleware.js";
import { getMyNotifications } from "../controllers/notificationController.js";

const router = express.Router();

router.get("/", authenticate, getMyNotifications);

export default router;
