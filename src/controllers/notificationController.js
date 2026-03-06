import pool from "../config/db.js";

// Get my notifications
export const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      `SELECT 
          notification_id,
          message,
          read_status,
          created_at
       FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId],
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Get Notifications Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Mark notification as read
export const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.userId;

    const result = await pool.query(
      `UPDATE notifications
       SET read_status = true
       WHERE notification_id = $1
       AND user_id = $2
       RETURNING notification_id`,
      [notificationId, userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    res.json({
      message: "Notification marked as read",
    });
  } catch (error) {
    console.error("Mark Notification Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
