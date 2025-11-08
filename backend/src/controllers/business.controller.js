import Business from "../models/Business.js";

// GET: obtener todos los negocios
export const getBusinesses = async (req, res) => {
  try {
    const businesses = await Business.find();
    res.json(businesses);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener negocios" });
  }
};

// POST: crear un nuevo negocio
export const createBusiness = async (req, res) => {
  try {
    console.log("📩 Datos recibidos:", req.body);

    const { nombre, whatsapp, email, plan } = req.body;

    if (!nombre || !whatsapp || !email) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    const newBusiness = new Business({
      nombre,
      whatsapp,
      email,
      plan: plan || "freemium",
    });

    await newBusiness.save();
    console.log("✅ Negocio creado:", newBusiness);
    res.status(201).json(newBusiness);
  } catch (error) {
    console.error("❌ Error al crear negocio:", error);
    res.status(500).json({ message: "Error al crear negocio", error: error.message });
  }
};
