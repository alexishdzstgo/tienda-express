import React, { useState } from "react";
import api from "../services/api";

const Register = () => {
  const [form, setForm] = useState({
    nombre: "",
    whatsapp: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await api.post("/auth/register", form);
      setMessage(res.data.message);
      setForm({ nombre: "", whatsapp: "", email: "" });
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Ocurrió un error al registrar el negocio"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 p-6">
      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-morado-medio mb-6 text-center">
          Registrar Negocio 🛍️
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-left text-sm text-gray-600 mb-1">Nombre del negocio</label>
            <input
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-verde-medio"
              required
            />
          </div>

          <div>
            <label className="block text-left text-sm text-gray-600 mb-1">Número de WhatsApp</label>
            <input
              type="text"
              name="whatsapp"
              value={form.whatsapp}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-verde-medio"
              required
            />
          </div>

          <div>
            <label className="block text-left text-sm text-gray-600 mb-1">Correo electrónico</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-verde-medio"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-verde-medio hover:bg-verde-oscuro text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
          >
            {loading ? "Registrando..." : "Registrar Negocio"}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-sm text-gray-700 bg-gray-100 p-2 rounded-lg">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default Register;
