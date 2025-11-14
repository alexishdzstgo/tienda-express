import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { ROLES, DEFAULT_ROLE } from "../constants/roles.js";

const userSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ROLES, default: DEFAULT_ROLE },
  fechaRegistro: { type: Date, default: Date.now },
});

// 🔒 Encriptar antes de guardar
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Comparar contraseñas
userSchema.methods.matchPassword = async function (passwordIngresada) {
  return await bcrypt.compare(passwordIngresada, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
