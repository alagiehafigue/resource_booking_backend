import app from "./app.js";
import dotenv from "dotenv";
import pool from "./config/db.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

// Test DB connection on startup
(async () => {
  try {
    await pool.query("SELECT 1");
    console.log("✅ Database connection verified");
  } catch (error) {
    console.error("❌ Database connection failed", error);
    process.exit(1);
  }
})();

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
