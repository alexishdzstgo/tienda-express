import mongoose from "mongoose";

const businessSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  whatsapp: { type: String, required: true },
  email: { type: String, required: true },
  plan: { type: String, default: "freemium" },
  fechaRegistro: { type: Date, default: Date.now },
});

const Business = mongoose.model("Business", businessSchema);
export default Business;
