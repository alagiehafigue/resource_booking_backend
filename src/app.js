import express from "express";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/authRoutes.js";
import { authenticate } from "./middleware/authmiddleware.js";
import adminRoutes from "./routes/adminRoutes.js";
import resourceRoutes from "./routes/resourceRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import approvalRoutes from "./routes/approvalRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import { errorHandler } from "./middleware/errormiddleware.js";

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/approvals", approvalRoutes);
app.use("/api/notifications", notificationRoutes);

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Backend is running" });
});

// To catch generic errors
app.use(errorHandler);

// To catch for all Not Found Page
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.path}`);
  res.status(404);
  next(error); //
});

export default app;
