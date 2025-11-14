import User from "../models/user.model.js";
import argon2 from "argon2";
import { isValidRole } from "../constants/roles.js";

// 🧩 Registrar nuevo administrador
export const registerAdmin = async (req, res) => {
  try {
  // Aceptar tanto 'role' (frontend en inglés) como 'rol' (español)
  const { nombre, email, password } = req.body;
    const incomingRole = req.body.role || req.body.rol || undefined;
    // Si se envía un role, validar que sea un role permitido
    if (incomingRole && !isValidRole(incomingRole)) {
      return res.status(400).json({ message: `Role inválido. Valores permitidos: ${JSON.stringify(require("../constants/roles.js").ROLES)}` });
    }

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
  // Si no se proporciona role, el modelo aplicará el default
  ...(incomingRole ? { role: incomingRole } : {}),
    });

    await newUser.save();
    res.status(201).json({ message: "Administrador registrado correctamente" });
  } catch (error) {
    console.error("❌ Error al registrar administrador:", error);
    res.status(500).json({ message: "Error al registrar administrador" });
  }
};

// 🧾 Registrar nuevo cliente (endpoint dedicado)
export const registerClient = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

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
      role: 'client',
    });

    await newUser.save();
    res.status(201).json({ message: "Cliente registrado correctamente" });
  } catch (error) {
    console.error("❌ Error al registrar cliente:", error);
    res.status(500).json({ message: "Error al registrar cliente" });
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
