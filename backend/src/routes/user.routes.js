import express from "express";
import { registerAdmin, registerClient, loginAdmin } from "../controllers/user.controller.js";

const router = express.Router();

// Legacy: /register kept for compatibility (admin)
router.post("/register", registerAdmin);
// New explicit endpoints
router.post("/register-admin", registerAdmin);
router.post("/register-client", registerClient);
router.post("/login", loginAdmin);

export default router;
