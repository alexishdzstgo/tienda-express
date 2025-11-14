import AdminRegisterForm from "../components/AdminRegisterForm";
import { Link } from "react-router-dom";

export default function AdminRegister() {
  return (
    <div className="p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link to="/admin" className="text-sm text-gray-600 hover:underline">← Volver al panel</Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-semibold mb-4">Crear administrador</h1>
          <p className="text-sm text-gray-600 mb-4">Aquí puedes crear nuevas cuentas de administrador. Asegúrate de incluir el código de país en el teléfono.</p>
          <AdminRegisterForm />
        </div>
      </div>
    </div>
  );
}
