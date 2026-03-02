import pool from "../config/db.js";
import { createNotification } from "../utils/notification.js";

// create Booking
export const createBooking = async (req, res) => {
  try {
    const { resource_id, start_time, end_time } = req.body;
    const { userId, role } = req.user;

    if (!resource_id || !start_time || !end_time) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const start = new Date(start_time);
    const end = new Date(end_time);

    if (start >= end) {
      return res
        .status(400)
        .json({ message: "End time must be after start time" });
    }

    if (start < new Date()) {
      return res.status(400).json({ message: "Cannot book in the past" });
    }

    // Check resource exists
    const resourceResult = await pool.query(
      "SELECT * FROM resources WHERE resource_id = $1",
      [resource_id],
    );

    if (resourceResult.rows.length === 0) {
      return res.status(404).json({ message: "Resource not found" });
    }

    const resource = resourceResult.rows[0];

    if (!resource.availability_status) {
      return res.status(400).json({ message: "Resource is unavailable" });
    }

    // Conflict detection
    const conflict = await pool.query(
      `SELECT booking_id FROM bookings
       WHERE resource_id = $1
       AND status IN ('pending', 'confirmed')
       AND ($2 < end_time AND $3 > start_time)`,
      [resource_id, start, end],
    );

    if (conflict.rows.length > 0) {
      return res.status(409).json({ message: "Time slot already booked" });
    }

    // Status logic
    let status = "confirmed";

    if (resource.approval_required) {
      if (role === "student") {
        status = "pending";
      } else if (role === "faculty") {
        status = "confirmed"; // faculty bypass
      }
    }

    const booking = await pool.query(
      `INSERT INTO bookings 
       (user_id, resource_id, start_time, end_time, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, resource_id, start, end, status],
    );

    // Notify user
    await createNotification(
      userId,
      `Your booking for ${resource.resource_name} is ${status}`,
    );

    res.status(201).json({
      message: "Booking created successfully",
      booking: booking.rows[0],
    });
  } catch (error) {
    console.error("Create Booking Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get my bookings
export const getMyBookings = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      `SELECT 
          bookings.booking_id,
          bookings.start_time,
          bookings.end_time,
          bookings.status,
          resources.resource_name,
          resources.image_url,
          resources.location,
          resources.capacity
       FROM bookings
       JOIN resources 
       ON bookings.resource_id = resources.resource_id
       WHERE bookings.user_id = $1
       ORDER BY bookings.start_time DESC`,
      [userId],
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Get My Bookings Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

//  Get all bookings by admin
export const getAllBookings = async (req, res) => {
  try {
    const { role } = req.user;

    if (role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const result = await pool.query(
      `SELECT 
          bookings.booking_id,
          bookings.start_time,
          bookings.end_time,
          bookings.status,
          users.name AS user_name,
          users.email,
          resources.resource_name,
          resources.image_url,
          resources.location,
          resources.capacity
       FROM bookings
       JOIN users ON bookings.user_id = users.user_id
       JOIN resources ON bookings.resource_id = resources.resource_id
       ORDER BY bookings.start_time DESC`,
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Get All Bookings Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin (approve booking)
export const approveBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { role } = req.user;

    if (role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const bookingResult = await pool.query(
      "SELECT * FROM bookings WHERE booking_id = $1",
      [bookingId],
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const booking = bookingResult.rows[0];

    if (booking.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Only pending bookings can be approved" });
    }

    await pool.query(
      "UPDATE bookings SET status = 'confirmed' WHERE booking_id = $1",
      [bookingId],
    );

    await createNotification(booking.user_id, "Your booking has been approved");

    res.json({ message: "Booking approved successfully" });
  } catch (error) {
    console.error("Approve Booking Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin (Reject Booking)
export const rejectBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { role } = req.user;

    if (role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const bookingResult = await pool.query(
      "SELECT * FROM bookings WHERE booking_id = $1",
      [bookingId],
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const booking = bookingResult.rows[0];

    if (booking.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Only pending bookings can be rejected" });
    }

    await pool.query(
      "UPDATE bookings SET status = 'rejected' WHERE booking_id = $1",
      [bookingId],
    );

    await createNotification(booking.user_id, "Your booking has been rejected");

    res.json({ message: "Booking rejected successfully" });
  } catch (error) {
    console.error("Reject Booking Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Cancel booking
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
    console.error("Cancel Booking Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
