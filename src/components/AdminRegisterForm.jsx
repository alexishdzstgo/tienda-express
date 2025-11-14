import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle } from "lucide-react";
import { registerAdmin } from "../services/authService";

export default function AdminRegisterForm() {
  const [form, setForm] = useState({ nombre: "", email: "", password: "", confirmar: "" });
  const [mensaje, setMensaje] = useState("");
  const [errores, setErrores] = useState({});
  const [touched, setTouched] = useState({ nombre: false, email: false, password: false, confirmar: false });
  const [validaciones, setValidaciones] = useState({ nombre: null, email: null, password: null, confirmar: null });
  const [fuerza, setFuerza] = useState({ nivel: 0, texto: "", color: "" });

  // Validadores (mismo comportamiento que en AuthPage)
  const validarNombre = (nombre) => {
    const partes = nombre.trim().split(" ");
    return partes.length >= 3 && partes.every((p) => p.length > 1);
  };

  const validarEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const validarPassword = (password) => {
    return (
      /[a-z]/.test(password) &&
      /[A-Z]/.test(password) &&
      /\d/.test(password) &&
      /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password) &&
      password.length >= 12
    );
  };

  const calcularFuerza = (password) => {
    let nivel = 0;
    if (password.length >= 12) nivel++;
    if (/[a-z]/.test(password)) nivel++;
    if (/[A-Z]/.test(password)) nivel++;
    if (/\d/.test(password)) nivel++;
    if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) nivel++;

    const niveles = [
      { texto: "Muy débil", color: "red" },
      { texto: "Débil", color: "orange" },
      { texto: "Regular", color: "gold" },
      { texto: "Buena", color: "#8BC34A" },
      { texto: "Fuerte", color: "#4CAF50" },
    ];

    return { nivel, ...niveles[Math.max(0, Math.min(nivel - 1, niveles.length - 1))] };
  };

  // Icono de validación animado, reutilizable
  const IconoValidacion = ({ valido }) => (
    <AnimatePresence mode="wait">
      {valido === true && (
        <motion.div
          key="ok"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.6 }}
          className="absolute right-3 top-9 text-green-500"
        >
          <CheckCircle size={20} />
        </motion.div>
      )}
      {valido === false && (
        <motion.div
          key="error"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.6 }}
          className="absolute right-3 top-9 text-red-500"
        >
          <XCircle size={20} />
        </motion.div>
      )}
    </AnimatePresence>
  );

  useEffect(() => {
    // mantener fuerza actualizada cuando cambie la contraseña
    setFuerza(calcularFuerza(form.password));
    setValidaciones((prev) => ({
      ...prev,
      password: form.password ? validarPassword(form.password) : null,
      confirmar: form.confirmar ? form.confirmar === form.password : null,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.password, form.confirmar]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (!touched[name]) setTouched((p) => ({ ...p, [name]: true }));

    if (name === "nombre") {
      setValidaciones((prev) => ({ ...prev, nombre: validarNombre(value) }));
    }
    if (name === "email") {
      setValidaciones((prev) => ({ ...prev, email: validarEmail(value) }));
    }
    if (name === "password") {
      const nivel = calcularFuerza(value);
      setFuerza(nivel);
      setValidaciones((prev) => ({ ...prev, password: validarPassword(value) }));
    }
    if (name === "confirmar") {
      setValidaciones((prev) => ({ ...prev, confirmar: value === form.password && value !== "" }));
    }
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!validarNombre(form.nombre)) {
      nuevosErrores.nombre = "Incluye nombre y dos apellidos (mín. 3 palabras).";
    }
    if (!validarEmail(form.email)) {
      nuevosErrores.email = "Correo inválido.";
    }
    if (!validarPassword(form.password)) {
      nuevosErrores.password = "La contraseña debe tener mínimo 12 caracteres, mayúsculas, minúsculas, número y símbolo.";
    }
    if (form.password !== form.confirmar) {
      nuevosErrores.confirmar = "Las contraseñas no coinciden.";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarFormulario()) {
      setMensaje("❌ Corrige los errores antes de continuar");
      return;
    }

    try {
      const payload = { nombre: form.nombre, email: form.email, password: form.password };
      await registerAdmin(payload);
      setMensaje("✅ Administrador registrado correctamente");
      setForm({ nombre: "", email: "", password: "", confirmar: "" });
      setErrores({});
      setTouched({ nombre: false, email: false, password: false, confirmar: false });
      setValidaciones({ nombre: null, email: null, password: null, confirmar: null });
    } catch (error) {
      console.error("❌ Error al registrar administrador:", error);
      const msg = error.response?.data?.message || "Error al registrar administrador";
      setMensaje(msg);
    }
  };

  const variants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 10 },
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 max-w-md w-full">
      <h3 className="text-lg font-semibold mb-3 text-gray-700">Crear cuenta administrador</h3>
      <motion.form onSubmit={handleSubmit} className="space-y-3" variants={variants} initial="hidden" animate="visible" exit="exit">
        <div className="relative">
          <label className="block text-sm text-gray-600 mb-1">Nombre completo</label>
          <input
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 ${errores.nombre ? 'border-red-500' : 'border-gray-200'}`}
          />
          {touched.nombre && <IconoValidacion valido={validaciones.nombre} />}
          {errores.nombre && <p className="text-red-500 text-sm mt-1">{errores.nombre}</p>}
        </div>

        <div className="relative">
          <label className="block text-sm text-gray-600 mb-1">Correo electrónico</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 ${errores.email ? 'border-red-500' : 'border-gray-200'}`}
          />
          {touched.email && <IconoValidacion valido={validaciones.email} />}
          {errores.email && <p className="text-red-500 text-sm mt-1">{errores.email}</p>}
        </div>

        <div className="relative">
          <label className="block text-sm text-gray-600 mb-1">Contraseña</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 ${errores.password ? 'border-red-500' : 'border-gray-200'}`}
          />
          {touched.password && <IconoValidacion valido={validaciones.password} />}
          {fuerza && form.password && (
            <p className="text-xs mt-1" style={{ color: fuerza.color }}>{fuerza.texto}</p>
          )}
          {errores.password && <p className="text-red-500 text-sm mt-1">{errores.password}</p>}
        </div>

        <div className="relative">
          <label className="block text-sm text-gray-600 mb-1">Confirmar contraseña</label>
          <input
            type="password"
            name="confirmar"
            value={form.confirmar}
            onChange={handleChange}
            className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 ${errores.confirmar ? 'border-red-500' : 'border-gray-200'}`}
          />
          {touched.confirmar && <IconoValidacion valido={validaciones.confirmar} />}
          {errores.confirmar && <p className="text-red-500 text-sm mt-1">{errores.confirmar}</p>}
        </div>

        <button className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition">Crear administrador</button>
      </motion.form>

      {mensaje && <p className="mt-3 text-sm text-gray-700">{mensaje}</p>}
    </div>
  );
}
