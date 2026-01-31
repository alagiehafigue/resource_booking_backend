import express from "express";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// routes
app.use("/api/auth", authRoutes);

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Backend is running" });
});

export default app;
