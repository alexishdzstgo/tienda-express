import express from "express";
import { getBusinesses, createBusiness } from "../controllers/business.controller.js";

const router = express.Router();

router.get("/", getBusinesses);
router.post("/", createBusiness);

export default router;
