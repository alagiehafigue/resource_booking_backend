import pool from "../config/db.js";

export const createNotification = async (userId, message) => {
  await pool.query(
    `INSERT INTO notifications (user_id, message)
     VALUES ($1, $2)`,
    [userId, message],
  );
};
