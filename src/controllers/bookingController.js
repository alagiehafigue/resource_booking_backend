import pool from "../config/db.js";
import { createNotification } from "../utils/notification.js";

export const createBooking = async (req, res) => {
  try {
    const { resource_id, start_time, end_time } = req.body;
    const { userId, role } = req.user;

    if (!resource_id || !start_time || !end_time) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const resourceResult = await pool.query(
      "SELECT * FROM resources WHERE resource_id = $1",
      [resource_id],
    );

    if (resourceResult.rows.length === 0) {
      return res.status(404).json({ message: "Resource not found" });
    }

    const resource = resourceResult.rows[0];

    if (!resource.availability_status) {
      return res.status(400).json({ message: "Resource unavailable" });
    }

    // Conflict check
    const conflict = await pool.query(
      `SELECT booking_id FROM bookings
       WHERE resource_id = $1
       AND status IN ('pending', 'confirmed')
       AND ($2 < end_time AND $3 > start_time)`,
      [resource_id, start_time, end_time],
    );

    if (conflict.rows.length > 0) {
      return res.status(409).json({ message: "Time slot already booked" });
    }

    // Faculty priority logic
    let status = "confirmed";

    if (resource.approval_required && role === "student") {
      status = "pending";
    }

    const booking = await pool.query(
      `INSERT INTO bookings 
       (user_id, resource_id, start_time, end_time, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, resource_id, start_time, end_time, status],
    );

    res.status(201).json(booking.rows[0]);

    await createNotification(
      userId,
      `Your booking for resource ${resource.resource_name} is ${status}`,
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMyBookings = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      `SELECT bookings.*, resources.resource_name
       FROM bookings
       JOIN resources ON bookings.resource_id = resources.resource_id
       WHERE bookings.user_id = $1
       ORDER BY bookings.created_at DESC`,
      [userId],
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { userId, role } = req.user;

    const bookingResult = await pool.query(
      "SELECT * FROM bookings WHERE booking_id = $1",
      [bookingId],
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const booking = bookingResult.rows[0];

    if (role !== "admin" && booking.user_id !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    await pool.query(
      "UPDATE bookings SET status = 'cancelled' WHERE booking_id = $1",
      [bookingId],
    );

    await createNotification(
      booking.user_id,
      "Your booking has been cancelled",
    );

    res.json({ message: "Booking cancelled successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
