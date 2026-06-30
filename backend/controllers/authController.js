import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// credentials loaded from env — never hardcoded
const VALID_USERNAME = process.env.ADMIN_USERNAME;
const VALID_PASSWORD = process.env.ADMIN_PASSWORD;

export const login = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ success: false, message: "Username and password are required" });

  if (username !== VALID_USERNAME || password !== VALID_PASSWORD)
    return res.status(401).json({ success: false, message: "Invalid credentials" });

  const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: "7d" });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.status(200).json({ success: true, message: "Logged in successfully" });
};

export const logout = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

export const checkAuth = (req, res) => {
  res.status(200).json({ success: true, username: req.user.username });
};
