import rateLimit from "express-rate-limit";

const isProduction = process.env.NODE_ENV === "production";

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProduction ? 5 : 1000, //  difference here
  message: "Too many login attempts. Try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});
