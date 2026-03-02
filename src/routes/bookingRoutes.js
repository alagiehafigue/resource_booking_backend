import express from "express";
import { authenticate } from "../middleware/authmiddleware.js";
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
router.get("/", authenticate, getAllBookings);

router.put("/:bookingId/approve", authenticate, approveBooking);
router.put("/:bookingId/reject", authenticate, rejectBooking);

router.delete("/:bookingId", authenticate, cancelBooking);

export default router;
