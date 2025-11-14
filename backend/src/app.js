import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import businessRoutes from "./routes/business.routes.js";
import userRoutes from "./routes/user.routes.js";
import authRoutes from "./routes/auth.routes.js";

dotenv.config();
connectDB();

const app = express();

// ✅ Middleware para interpretar JSON
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // 👈 este también ayuda para formularios

// Rutas
app.use("/api/businesses", businessRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);

export default app;
