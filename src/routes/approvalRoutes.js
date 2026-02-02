import express from "express";
import { authenticate } from "../middleware/authmiddleware.js";
import { authorizeRoles } from "../middleware/rolemiddleware.js";
import {
  getPendingBookings,
  updateBookingStatus,
} from "../controllers/approvalController.js";

const router = express.Router();

router.get(
  "/pending",
  authenticate,
  authorizeRoles("admin"),
  getPendingBookings,
);

router.put(
  "/update",
  authenticate,
  authorizeRoles("admin"),
  updateBookingStatus,
);

export default router;
