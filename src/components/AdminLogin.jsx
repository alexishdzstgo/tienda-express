import { useState } from "react";
import axios from "axios";

export default function AdminLogin() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [mensaje, setMensaje] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/users/login", form);
      localStorage.setItem("token", res.data.token);
      setMensaje("✅ Sesión iniciada correctamente");
      console.log(res.data);
    } catch (error) {
      console.error("❌ Error en login:", error);
      setMensaje("❌ Credenciales incorrectas");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-700">Login Administrador</h2>

      <form onSubmit={handleSubmit} className="bg-white shadow-lg p-6 rounded-lg w-full max-w-sm">
        <input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          value={form.email}
          onChange={handleChange}
          className="w-full mb-3 border rounded p-2"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={handleChange}
          className="w-full mb-4 border rounded p-2"
          required
        />
        <button
          type="submit"
          className="w-full bg-purple-600 text-white p-2 rounded hover:bg-purple-700 transition"
        >
          Iniciar Sesión
        </button>
      </form>

      {mensaje && <p className="mt-4 text-gray-700">{mensaje}</p>}
    </div>
  );
}
