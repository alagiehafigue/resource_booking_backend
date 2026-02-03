import pool from "../config/db.js";

export const getPendingBookings = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT bookings.booking_id, users.name, resources.resource_name,
              bookings.start_time, bookings.end_time
       FROM bookings
       JOIN users ON bookings.user_id = users.user_id
       JOIN resources ON bookings.resource_id = resources.resource_id
       WHERE bookings.status = 'pending'`,
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId, status } = req.body;

    if (!bookingId || !["confirmed", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid request" });
    }

    const result = await pool.query(
      `UPDATE bookings
       SET status = $1
       WHERE booking_id = $2 AND status = 'pending'
       RETURNING *`,
      [status, bookingId],
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Booking not found or already handled" });
    }

    res.json({ message: "Booking updated successfully" });
    const booking = result.rows[0];

    await createNotification(
      booking.user_id,
      `Your booking request has been ${status}`,
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
