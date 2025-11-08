import { useState, useEffect } from "react";
import axios from "axios";
import { CheckCircle, XCircle } from "lucide-react";

export default function BusinessForm({ selectedBusiness, onSave }) {
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    direccion: "",
    telefono: "",
    categoria: "",
  });

  const [mensaje, setMensaje] = useState(null);
  const [tipo, setTipo] = useState(""); // "exito" | "error"

  useEffect(() => {
    if (selectedBusiness) {
      setForm(selectedBusiness);
    }
  }, [selectedBusiness]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (selectedBusiness?._id) {
        await axios.put(
          `http://localhost:5000/api/business/${selectedBusiness._id}`,
          form
        );
        setTipo("exito");
        setMensaje("Negocio actualizado correctamente");
      } else {
        await axios.post("http://localhost:5000/api/business", form);
        setTipo("exito");
        setMensaje("Negocio agregado correctamente");
      }
      onSave(); // refresca la lista
      setForm({
        nombre: "",
        descripcion: "",
        direccion: "",
        telefono: "",
        categoria: "",
      });
    } catch (error) {
      console.error("Error al guardar:", error);
      setTipo("error");
      setMensaje("Hubo un error al guardar el negocio");
    }
  };

  return (
    <div className="bg-white shadow-md rounded-2xl p-6 w-full max-w-lg">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">
        {selectedBusiness ? "Editar Negocio" : "Agregar Negocio"}
      </h2>

      {mensaje && (
        <div
          className={`flex items-center gap-2 mb-3 text-sm ${
            tipo === "exito" ? "text-green-600" : "text-red-600"
          }`}
        >
          {tipo === "exito" ? (
            <CheckCircle size={18} />
          ) : (
            <XCircle size={18} />
          )}
          <span>{mensaje}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="nombre"
          placeholder="Nombre del negocio"
          value={form.nombre}
          onChange={handleChange}
          className="w-full border rounded-lg px-3 py-2 focus:outline-purple-500"
          required
        />

        <textarea
          name="descripcion"
          placeholder="Descripción"
          value={form.descripcion}
          onChange={handleChange}
          className="w-full border rounded-lg px-3 py-2 h-20 focus:outline-purple-500"
        />

        <input
          type="text"
          name="direccion"
          placeholder="Dirección"
          value={form.direccion}
          onChange={handleChange}
          className="w-full border rounded-lg px-3 py-2 focus:outline-purple-500"
        />

        <input
          type="tel"
          name="telefono"
          placeholder="Teléfono"
          value={form.telefono}
          onChange={handleChange}
          className="w-full border rounded-lg px-3 py-2 focus:outline-purple-500"
        />

        <input
          type="text"
          name="categoria"
          placeholder="Categoría"
          value={form.categoria}
          onChange={handleChange}
          className="w-full border rounded-lg px-3 py-2 focus:outline-purple-500"
        />

        <button
          type="submit"
          className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-4 py-2 w-full transition"
        >
          {selectedBusiness ? "Guardar Cambios" : "Agregar Negocio"}
        </button>
      </form>
    </div>
  );
}
