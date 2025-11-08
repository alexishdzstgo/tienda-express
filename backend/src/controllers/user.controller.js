import User from "../models/user.model.js";
import argon2 from "argon2";

// 🧩 Registrar nuevo administrador
export const registerAdmin = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;

    // Verificar si el correo ya existe
    const existeUsuario = await User.findOne({ email });
    if (existeUsuario) {
      return res.status(400).json({ message: "El correo ya está registrado" });
    }

    // Encriptar la contraseña con argon2
    const hashedPassword = await argon2.hash(password);

    const newUser = new User({
      nombre,
      email,
      password: hashedPassword,
      rol,
    });

    await newUser.save();
    res.status(201).json({ message: "Administrador registrado correctamente" });
  } catch (error) {
    console.error("❌ Error al registrar administrador:", error);
    res.status(500).json({ message: "Error al registrar administrador" });
  }
};

// 🔐 Iniciar sesión
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("📩 Datos recibidos en login:", { email, password });

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Usuario no encontrado" });
    }

    // Verificar la contraseña con argon2
    const passwordValida = await argon2.verify(user.password, password);
    if (!passwordValida) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    res.json({ message: "Login exitoso", user });
  } catch (error) {
    console.error("❌ Error en login:", error);
    res.status(500).json({ message: "Error en el login" });
  }
};
