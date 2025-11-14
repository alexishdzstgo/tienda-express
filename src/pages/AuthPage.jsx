import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle } from "lucide-react";
import api from "../services/api";
import { openOAuthPopup, registerClient, login as authLogin } from "../services/authService";
import { AsYouType, parsePhoneNumberFromString } from "libphonenumber-js";
import "../styles/AuthPage.css";


export default function AuthPage() {
  const [modo, setModo] = useState("login"); // login | register
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    password: "",
    confirmar: "",
    telefono: "",
  });
  const [mensaje, setMensaje] = useState("");
  const [errores, setErrores] = useState({});
  const [validaciones, setValidaciones] = useState({
    nombre: null,
    email: null,
    password: null,
    confirmar: null,
    telefono: null,
  });
  const [fuerza, setFuerza] = useState({ nivel: 0, texto: "", color: "" });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  // track touched fields so validation icons only appear after the user interacts
  const [touched, setTouched] = useState({
    nombre: false,
    email: false,
    password: false,
    confirmar: false,
    telefono: false,
  });

  // Usaremos libphonenumber-js para formateo y validación.
  const validarTelefono = (tel) => {
    if (!tel) return false;
    try {
      const pn = parsePhoneNumberFromString(tel, "MX");
      return !!(pn && pn.isValid());
    } catch (e) {
      return false;
    }
  };

  const formatPhoneMX = (value) => {
    if (!value) return "+52 ";
    try {
      const formatted = new AsYouType('MX').input(value);
      // AsYouType may return empty string for partial input; fallback a +52
      return formatted || "+52 ";
    } catch (e) {
      return value;
    }
  };

  const normalizePhone = (value) => {
    if (!value) return "";
    try {
      const pn = parsePhoneNumberFromString(value, "MX");
      if (pn && pn.isValid()) return pn.number; // E.164
      // fallback: strip non-digits and prefix +52
      const digits = value.replace(/\D/g, "");
      if (digits.startsWith("52")) return "+" + digits;
      return "+52" + digits;
    } catch (e) {
      const digits = value.replace(/\D/g, "");
      if (digits.startsWith("52")) return "+" + digits;
      return "+52" + digits;
    }
  };

  // 🔍 Validadores
  const validarNombre = (nombre) => {
    const partes = nombre.trim().split(" ");
    return partes.length >= 3 && partes.every((p) => p.length > 1);
  };

  const validarEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

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

    return { nivel, ...niveles[Math.min(nivel - 1, niveles.length - 1)] };
  };


  // ✅ Manejo de cambios
  const handleChange = (e) => {
    const { name, value } = e.target;
    setMensaje("");
    // marcar campo como 'touched' la primera vez que se escribe
    if (!touched[name]) setTouched((prev) => ({ ...prev, [name]: true }));

    // Manejo especial para teléfono: aplicar máscara MX usando libphonenumber-js
    if (name === "telefono") {
      const formatted = formatPhoneMX(value);
      setForm((prev) => ({ ...prev, telefono: formatted }));
      setValidaciones((prev) => ({ ...prev, telefono: validarTelefono(formatted) }));
      return;
    }

    setForm({ ...form, [name]: value });

    if (modo === "register") {
      if (name === "nombre") {
        setValidaciones((prev) => ({
          ...prev,
          nombre: validarNombre(value),
        }));
      }
      if (name === "email") {
        setValidaciones((prev) => ({
          ...prev,
          email: validarEmail(value),
        }));
      }
      if (name === "password") {
        const esValida = validarPassword(value);
        const nivelFuerza = calcularFuerza(value);
        setValidaciones((prev) => ({
          ...prev,
          password: esValida,
        }));
        setFuerza(nivelFuerza);
      }
      if (name === "confirmar") {
        setValidaciones((prev) => ({
          ...prev,
          confirmar: value === form.password && value !== "",
        }));
      }
    }
  };

  // 🧾 Envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    const nuevosErrores = {};

    if (modo === "register") {
      if (!validarNombre(form.nombre))
        nuevosErrores.nombre = "Debe incluir nombre y dos apellidos.";
      if (!validarEmail(form.email))
        nuevosErrores.email = "El correo no es válido.";
      if (!validarPassword(form.password))
        nuevosErrores.password =
          "La contraseña debe tener mínimo 12 caracteres, mayúsculas, minúsculas, número y símbolo.";
      if (form.password !== form.confirmar)
        nuevosErrores.confirmar = "Las contraseñas no coinciden.";
      if (!validarTelefono(form.telefono))
        nuevosErrores.telefono = "Número de teléfono inválido.";
    } else {
      if (!form.email.trim()) nuevosErrores.email = "Correo obligatorio.";
      if (!form.password.trim())
        nuevosErrores.password = "Contraseña obligatoria.";
    }

    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    try {
      setIsLoading(true);
      let res;
      if (modo === "register") {
        // Normalizar teléfono a E.164 antes de enviar
        const payload = { ...form, telefono: normalizePhone(form.telefono) };
        res = await registerClient(payload);
      } else {
        res = await authLogin(form);
      }

      setMensaje(modo === "register" ? "✅ Registro exitoso" : "✅ Inicio de sesión exitoso");
      // Guardar la respuesta (token/usuario) — adaptar según backend
      if (modo === "register") localStorage.setItem("userData", JSON.stringify(res.data));
      else localStorage.setItem("adminData", JSON.stringify(res.data));
      if (modo === "login") navigate("/admin");
    } catch (error) {
      // Mejorar detalle de error si el backend lo provee
      const err = error || {};
      const serverMsg = err.response?.data?.message || err.response?.data || err.message;

      // Si el backend devuelve validaciones por campo en `errors`, mostrarlas inline
      if (err.response?.data?.errors && typeof err.response.data.errors === "object") {
        setErrores(err.response.data.errors);
      } else {
        setMensaje(`❌ ${serverMsg || "Ocurrió un error, revisa tus datos"}`);
      }
    }
    finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    // Abrir popup y esperar respuesta (usa la utilidad en src/services/authService)
    const url = "http://localhost:5000/api/auth/google";
    openOAuthPopup(url)
      .then((data) => {
        // data puede incluir token y user
        if (data?.token) {
          // Guardar según rol (si backend envía role)
          if (data?.role === "admin") {
            localStorage.setItem("adminData", JSON.stringify(data));
            navigate("/admin");
          } else {
            localStorage.setItem("userData", JSON.stringify(data));
            navigate("/");
          }
        }
      })
      .catch((err) => {
        console.warn("OAuth popup cerrado o falló:", err);
      });
  };

  // Si la URL contiene ?mode=register o ?mode=login, usar ese modo al montar la página.
  useEffect(() => {
    const qs = new URLSearchParams(location.search);
    const m = qs.get("mode");
    if (m === "register" || m === "login") setModo(m);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  // Cuando entramos en modo register, prellenar el campo teléfono con el prefijo +52
  useEffect(() => {
    if (modo === "register" && (!form.telefono || form.telefono.trim() === "")) {
      setForm((prev) => ({ ...prev, telefono: "+52 " }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modo]);

  // Detectar si la navegación incluye `instant=1` para suprimir la animación de entrada
  const qsInit = new URLSearchParams(location.search);
  const suppressEntry = qsInit.get("instant") === "1" || qsInit.get("instant") === "true";

  // 💫 Icono de validación animado
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

  // 🎞️ Transición
  const variants = {
    hidden: { opacity: 0, x: modo === "login" ? -50 : 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: modo === "login" ? 50 : -50 },
  };

  return (
    <div className="auth-container">
      {/* Nav superior fijo: usamos las clases de CSS personalizado para controlar posición y contraste */}
      <nav className="nav-container">
        <Link to="/" className="nav-title font-heading">
          Tienda-Express
        </Link>
      </nav>

      <div className="auth-form">
        <AnimatePresence>
          <motion.form
            key={modo}
            onSubmit={handleSubmit}
            variants={variants}
            initial={suppressEntry ? "visible" : "hidden"}
            animate="visible"
            exit="exit"
            transition={suppressEntry ? { duration: 0 } : { duration: 0.12 }}
            className="space-y-4"
          >
            <h2 className="text-xl font-semibold text-center text-gray-700 mb-2">
                {modo === "login"
                  ? "Iniciar Sesión"
                  : "Crear cuenta de cliente"}
            </h2>

            {/* 🔹 NOMBRE */}
            {modo === "register" && (
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre completo
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errores.nombre ? "border-red-500" : "border-gray-300"
                  }`}
                />
                <IconoValidacion valido={touched.nombre ? validaciones.nombre : null} />
                {errores.nombre && (
                  <p className="text-red-500 text-sm mt-1">{errores.nombre}</p>
                )}
              </div>
            )}

            {/* 🔹 TELÉFONO (solo en registro de cliente) */}
            {modo === "register" && (
              <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número de teléfono
                  </label>
                    <input
                      type="text"
                      name="telefono"
                      inputMode="tel"
                      placeholder={"Incluye código de país, ej. +52 1 55 1234 5678"}
                      value={form.telefono}
                      onChange={handleChange}
                      className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        errores.telefono ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                  <IconoValidacion valido={touched.telefono ? validaciones.telefono : null} />
                  {errores.telefono && (
                    <p className="text-red-500 text-sm mt-1">{errores.telefono}</p>
                  )}
                </div>
            )}

            {/* 🔹 CORREO */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errores.email ? "border-red-500" : "border-gray-300"
                }`}
              />
              {modo === "register" && (
                <IconoValidacion valido={touched.email ? validaciones.email : null} />
              )}
              {errores.email && (
                <p className="text-red-500 text-sm mt-1">{errores.email}</p>
              )}
            </div>

{/* 🔹 CONTRASEÑA */}
<div className="relative">
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Contraseña
  </label>
  <input
    type="password"
    name="password"
    value={form.password}
    onChange={handleChange}
    className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
      errores.password ? "border-red-500" : "border-gray-300"
    }`}
  />
  {modo === "register" && (
    <>
      <IconoValidacion valido={touched.password ? (fuerza.nivel >= 4) : null} />

      {fuerza.texto && (
        <div className="mt-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{
              width: `${(fuerza.nivel / 5) * 100}%`,
              background: `linear-gradient(90deg, red, orange, gold, #8BC34A, #4CAF50)`,
            }}
            transition={{ duration: 0.5 }}
            className="h-2 rounded-lg"
          ></motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs mt-1 text-gray-600"
          >
            Fortaleza:{" "}
            <span style={{ color: fuerza.color }}>{fuerza.texto}</span>
            {fuerza.nivel < 3 && " — demasiado débil"}
            {fuerza.nivel >= 4 && " — contraseña segura"}
          </motion.p>
        </div>
      )}
    </>
  )}
  {errores.password && (
    <p className="text-red-500 text-sm mt-1">{errores.password}</p>
  )}
</div>


            {/* 🔹 CONFIRMAR CONTRASEÑA */}
            {modo === "register" && (
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar contraseña
                </label>
                <input
                  type="password"
                  name="confirmar"
                  value={form.confirmar}
                  onChange={handleChange}
                  className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errores.confirmar ? "border-red-500" : "border-gray-300"
                  }`}
                />
                <IconoValidacion valido={validaciones.confirmar} />
                {errores.confirmar && (
                  <p className="text-red-500 text-sm mt-1">
                    {errores.confirmar}
                  </p>
                )}
              </div>
            )}

            {/* 🔘 BOTÓN */}
            {modo === "login" && (
              <button
                type="button"
                onClick={handleGoogleAuth}
                className="w-full mb-2 bg-white border border-gray-300 text-gray-700 p-2 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-150 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M21.6 12.23c0-.82-.07-1.43-.21-2.06H12v3.9h5.56c-.11.9-.72 2.41-2.34 3.53l-.02.13 3.4 2.63.24.02c2.22-2.06 3.5-5.06 3.5-8.21z" fill="#4285F4"/>
                  <path d="M12 22c2.97 0 5.46-.98 7.28-2.66l-3.47-2.68c-.96.66-2.18 1.12-3.81 1.12-2.93 0-5.41-1.98-6.3-4.65l-.13.01-3.42 2.64-.045.13C4.97 19.9 8.23 22 12 22z" fill="#34A853"/>
                  <path d="M5.7 13.12a8.02 8.02 0 010-2.24l-.02-.13L2.22 8.12l-.14.07A11.98 11.98 0 000 12c0 1.94.44 3.78 1.22 5.45L5.7 13.12z" fill="#FBBC05"/>
                  <path d="M12 6.36c1.61 0 3.06.56 4.2 1.65l3.15-3.06C17.44 2.57 14.97 1.6 12 1.6 8.23 1.6 4.97 3.7 2.75 6.76l3.44 2.64C6.59 8.34 9.07 6.36 12 6.36z" fill="#EA4335"/>
                </svg>
                Iniciar sesión con Google
              </button>
            )}
            <button
              type="submit"
              className="w-full bg-purple-600 text-white p-2 rounded-lg font-semibold hover:bg-purple-700 transition-all duration-200"
              disabled={isLoading}
            >
              {isLoading ? (modo === "login" ? "Iniciando..." : "Registrando...") : (modo === "login" ? "Iniciar sesión" : "Registrarme")}
            </button>

            {/* 💬 MENSAJE */}
            {mensaje && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center text-sm text-gray-700"
              >
                {mensaje}
              </motion.p>
            )}

            {/* 🔄 CAMBIO DE MODO */}
            <p className="text-center text-sm text-gray-600">
              {modo === "login" ? (
                <>
                  ¿No tienes cuenta?{" "}
                  <button
                    type="button"
                    onClick={() => setModo("register")}
                    className="text-purple-600 hover:underline"
                  >
                    Regístrate
                  </button>
                </>
              ) : (
                <>
                  ¿Ya tienes cuenta?{" "}
                  <button
                    type="button"
                    onClick={() => setModo("login")}
                    className="text-purple-600 hover:underline"
                  >
                    Inicia sesión
                  </button>
                </>
              )}
            </p>
          </motion.form>
        </AnimatePresence>
      </div>
    </div>
  );
  
}

