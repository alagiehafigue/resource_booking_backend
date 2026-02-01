import pool from "../config/db.js";

export const createResource = async (req, res) => {
  try {
    const {
      resource_name,
      resource_type,
      availability_status,
      approval_required,
    } = req.body;

    if (!resource_name || !resource_type) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const result = await pool.query(
      `INSERT INTO resources 
       (resource_name, resource_type, availability_status, approval_required)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        resource_name,
        resource_type,
        availability_status ?? true,
        approval_required ?? false,
      ],
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
