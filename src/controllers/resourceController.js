import pool from "../config/db.js";

// Get all resources for home page
export const getAllResources = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
          resource_id,
          resource_name,
          image_url,
          description,
          location,
          capacity,
          availability_status,
          approval_required
       FROM resources
       ORDER BY resource_id DESC`,
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Get Resources Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

//  Get a single resource
export const getResourceById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT 
          resource_id,
          resource_name,
          image_url,
          description,
          location,
          capacity,
          availability_status,
          approval_required
       FROM resources
       WHERE resource_id = $1`,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Resource not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Get Resource By Id Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// delete resource admin only
export const deleteResource = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.user;

    if (role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Check resource exists
    const resourceCheck = await pool.query(
      "SELECT * FROM resources WHERE resource_id = $1",
      [id],
    );

    if (resourceCheck.rows.length === 0) {
      return res.status(404).json({ message: "Resource not found" });
    }

    // Check for active bookings
    const activeBookings = await pool.query(
      `SELECT booking_id FROM bookings
       WHERE resource_id = $1
       AND status IN ('pending', 'confirmed')`,
      [id],
    );

    if (activeBookings.rows.length > 0) {
      return res.status(400).json({
        message:
          "Cannot delete resource with active bookings (pending or confirmed)",
      });
    }

    // Safe to delete
    await pool.query("DELETE FROM resources WHERE resource_id = $1", [id]);

    res.json({ message: "Resource deleted successfully" });
  } catch (error) {
    console.error("Delete Resource Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
