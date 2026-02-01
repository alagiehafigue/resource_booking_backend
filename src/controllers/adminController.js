import pool from "../config/db.js";

export const updateUserRole = async (req, res) => {
  try {
    const { userId, roleName } = req.body;

    if (!userId || !roleName) {
      return res.status(400).json({ message: "userId and roleName required" });
    }

    // Get role ID
    const roleResult = await pool.query(
      "SELECT role_id FROM roles WHERE role_name = $1",
      [roleName],
    );

    if (roleResult.rows.length === 0) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const roleId = roleResult.rows[0].role_id;

    // Update user role
    const result = await pool.query(
      "UPDATE users SET role_id = $1 WHERE user_id = $2 RETURNING user_id",
      [roleId, userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Role updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
