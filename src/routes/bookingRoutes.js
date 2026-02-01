import express from "express";
import { authenticate } from "../middleware/authmiddleware.js";
import { createBooking } from "../controllers/bookingController.js";

const router = express.Router();

router.post("/", authenticate, createBooking);

export default router;
