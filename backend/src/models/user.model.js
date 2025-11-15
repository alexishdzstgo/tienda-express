import mongoose from "mongoose";
import { ROLES, DEFAULT_ROLE } from "../constants/roles.js";

const userSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: DEFAULT_ROLE,
      enum: ROLES,
    },
  },
  {
    timestamps: true,
  }
);

// 🚫 No hay hooks de pre-save ni funciones de hash
// Todo el encriptado se maneja en el controlador con argon2

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
