import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const proteger = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decodificado = jwt.verify(token, "clave_secreta_tienda_expres");
      req.user = await User.findById(decodificado.id).select("-password");
      next();
    } catch (error) {
      res.status(401).json({ message: "Token inválido o expirado" });
    }
  } else {
    res.status(401).json({ message: "No autorizado, falta token" });
  }
};

export const soloAdmin = (req, res, next) => {
  if (req.user && req.user.rol === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Acceso denegado, requiere rol administrador" });
  }
};
