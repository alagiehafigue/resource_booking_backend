import pool from "../config/db.js";

export const createNotification = async (userId, message) => {
  await pool.query(
    `INSERT INTO notifications (user_id, message, read_status)
     VALUES ($1, $2, false)`,
    [userId, message],
  );
};
