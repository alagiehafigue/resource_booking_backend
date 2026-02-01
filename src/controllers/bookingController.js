import pool from "../config/db.js";

export const createBooking = async (req, res) => {
  try {
    const { resource_id, start_time, end_time } = req.body;
    const userId = req.user.userId;

    if (!resource_id || !start_time || !end_time) {
      return res.status(400).json({ message: "Missing fields" });
    }

    // Check resource
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

    // Check time conflict
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

    const role = req.user.role;

    // Determine booking status
    let status;

    if (resource.approval_required) {
      if (role === "faculty") {
        status = "confirmed"; // priority
      } else {
        status = "pending";
      }
    } else {
      status = "confirmed";
    }

    const booking = await pool.query(
      `INSERT INTO bookings 
       (user_id, resource_id, start_time, end_time, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, resource_id, start_time, end_time, status],
    );

    res.status(201).json(booking.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
