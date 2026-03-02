import pool from "../config/db.js";

export const createResource = async (req, res) => {
  try {
    const {
      resource_name,
      resource_type,
      availability_status,
      approval_required,
      image_url,
      description,
      location,
      capacity,
    } = req.body;

    // Required fields validation
    if (!resource_name || !resource_type || !location || !capacity) {
      return res.status(400).json({
        message:
          "resource_name, resource_type, location, and capacity are required",
      });
    }

    const result = await pool.query(
      `INSERT INTO resources 
       (resource_name, resource_type, availability_status, approval_required,
        image_url, description, location, capacity)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        resource_name,
        resource_type,
        availability_status ?? true,
        approval_required ?? false,
        image_url || null,
        description || null,
        location,
        capacity,
      ],
    );

    res.status(201).json({
      message: "Resource created successfully",
      resource: result.rows[0],
    });
  } catch (error) {
    console.error("Create Resource Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
