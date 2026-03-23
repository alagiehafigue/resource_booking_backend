import express from "express";
import { authenticate } from "../middleware/authmiddleware.js";
import { authorizeRoles } from "../middleware/rolemiddleware.js";
import {
  createBooking,
  getMyBookings,
  cancelBooking,
  getAllBookings,
  approveBooking,
  rejectBooking,
} from "../controllers/bookingController.js";

const router = express.Router();

router.post("/", authenticate, createBooking);
router.get("/my-bookings", authenticate, getMyBookings);
router.get("/", authenticate, authorizeRoles("admin"), getAllBookings);

router.put("/:bookingId/approve", authenticate, authorizeRoles("admin"), approveBooking);
router.put("/:bookingId/reject", authenticate, authorizeRoles("admin"), rejectBooking);

router.delete("/:bookingId", authenticate, cancelBooking);

export default router;
