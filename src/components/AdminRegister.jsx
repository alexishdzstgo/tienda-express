import { useState } from "react";
import axios from "axios";

export default function AdminRegister() {
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    password: "",
  });
  const [mensaje, setMensaje] = useState("");
  const [errores, setErrores] = useState({});

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!form.nombre.trim()) {
      nuevosErrores.nombre = "El nombre es obligatorio";
    }

    if (!form.email.trim()) {
      nuevosErrores.email = "El correo es obligatorio";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nuevosErrores.email = "El correo no tiene un formato válido";
    }

    if (!form.password.trim()) {
      nuevosErrores.password = "La contraseña es obligatoria";
    } else if (form.password.length < 6) {
      nuevosErrores.password = "Debe tener al menos 6 caracteres";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
      setMensaje("❌ Corrige los errores antes de continuar");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/users/register", form);
      setMensaje("✅ Administrador registrado correctamente");
      console.log(res.data);
      setForm({ nombre: "", email: "", password: "" });
      setErrores({});
    } catch (error) {
      console.error("❌ Error al registrar administrador:", error);
      if (error.response?.data?.message === "El usuario ya existe") {
        setMensaje("⚠️ El correo ya está registrado");
      } else {
        setMensaje("❌ Error al registrar administrador");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gray-50">
      {/* Fondo diagonal animado */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-400 via-purple-600 to-transparent animate-gradientMove clip-diagonal"></div>

      {/* Contenedor del formulario */}
      <div className="relative z-10 flex flex-col items-center p-6 w-full max-w-sm bg-white rounded-2xl shadow-2xl">
        <h1 className="text-3xl font-bold text-purple-700 mb-6 tracking-tight">
          Tienda-Express
        </h1>

        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          Registro de Administrador
        </h2>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre
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
            {errores.nombre && (
              <p className="text-red-500 text-sm mt-1">{errores.nombre}</p>
            )}
          </div>

          <div>
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
            {errores.email && (
              <p className="text-red-500 text-sm mt-1">{errores.email}</p>
            )}
          </div>

          <div>
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
            {errores.password && (
              <p className="text-red-500 text-sm mt-1">{errores.password}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 text-white p-2 rounded-lg font-semibold hover:bg-purple-700 transition-all duration-200"
          >
            Registrar
          </button>
        </form>

        {mensaje && <p className="mt-4 text-gray-700">{mensaje}</p>}
      </div>
    </div>
  );
}
