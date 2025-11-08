const Business = require('../models/Business');

exports.register = async (req, res) => {
  try {
    const { nombre, whatsapp, email } = req.body;

    const existing = await Business.findOne({ whatsapp });
    if (existing) return res.status(400).json({ message: 'Ya existe un negocio con este WhatsApp.' });

    const negocio = new Business({ nombre, whatsapp, email });
    await negocio.save();

    res.status(201).json({ message: 'Negocio registrado exitosamente ✅', negocio });
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar negocio', error: error.message });
  }
};
