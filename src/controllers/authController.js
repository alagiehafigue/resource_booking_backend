import bcrypt from "bcrypt";
import pool from "../config/db.js";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user exists
    const userExists = await pool.query(
      "SELECT user_id FROM users WHERE email = $1",
      [email],
    );

    if (userExists.rows.length > 0) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Get default role (student)
    const roleResult = await pool.query(
      "SELECT role_id FROM roles WHERE role_name = 'student'",
    );

    const roleId = roleResult.rows[0].role_id;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const newUser = await pool.query(
      `INSERT INTO users (name, email, password, role_id)
       VALUES ($1, $2, $3, $4)
       RETURNING user_id, name, email, created_at`,
      [name, email, hashedPassword, roleId],
    );

    res.status(201).json({
      message: "User registered successfully",
      user: newUser.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
