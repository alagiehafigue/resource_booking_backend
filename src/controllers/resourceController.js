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
