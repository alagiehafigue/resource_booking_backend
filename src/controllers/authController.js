import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import pool from "../config/db.js";

const generateAccessToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1m" });

const generateRefreshToken = (payload) =>
  jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body || {};

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

    if (roleResult.rows.length === 0) {
      return res.status(500).json({
        message: "Default role 'student' not found. Contact administrator.",
      });
    }

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

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Get user + role
    const result = await pool.query(
      `SELECT users.user_id, users.password, roles.role_name
       FROM users
       JOIN roles ON users.role_id = roles.role_id
       WHERE users.email = $1`,
      [email],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = result.rows[0];

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Create JWT

    const payload = { userId: user.user_id, role: user.role_name };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Store refresh token in DB
    await pool.query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at)
   VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
      [user.user_id, refreshToken],
    );

    // Cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: false, // true in production
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const logoutUser = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (refreshToken) {
    await pool.query("DELETE FROM refresh_tokens WHERE token = $1", [
      refreshToken,
    ]);
  }

  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  res.json({ message: "Logged out successfully" });
};

export const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token" });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Check token in DB
    const result = await pool.query(
      "SELECT * FROM refresh_tokens WHERE token = $1",
      [refreshToken],
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const payload = { userId: decoded.userId, role: decoded.role };

    const newAccessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: false,
      maxAge: 15 * 60 * 1000,
    });

    res.json({ message: "Access token refreshed" });
  } catch (error) {
    return res
      .status(403)
      .json({ message: "Refresh token expired or invalid" });
  }
};
