import mongoose from "mongoose";

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
    rol: {
      type: String,
      default: "admin",
      enum: ["admin", "empleado"],
    },
  },
  {
    timestamps: true,
  }
);

// 🚫 No hay hooks de pre-save ni funciones de hash
// Todo el encriptado se maneja en el controlador con argon2

const User = mongoose.model("User", userSchema);
export default User;
