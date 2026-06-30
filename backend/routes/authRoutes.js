import express from "express";
import { login, logout, checkAuth } from "../controllers/authController.js";
import { protectRoute } from "../middleware/auth.js";

const router = express.Router();

router.post("/login", login);
router.post("/logout", protectRoute, logout);
router.get("/check", protectRoute, checkAuth);

export default router;
