import express from "express";
import { authenticate } from "../middleware/authmiddleware.js";
import {
  createBooking,
  getMyBookings,
  cancelBooking,
} from "../controllers/bookingController.js";

const router = express.Router();

router.post("/", authenticate, createBooking);
router.post("/", authenticate, createBooking);
router.get("/my", authenticate, getMyBookings);
router.put("/cancel/:bookingId", authenticate, cancelBooking);

export default router;
