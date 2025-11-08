import { useState, useEffect } from "react";
import axios from "axios";
import {
  LayoutDashboard,
  Store,
  LogOut,
  Settings,
  Users,
  Menu,
} from "lucide-react";
import BusinessForm from "../components/BusinessForm";

export default function AdminDashboard() {
  const [collapsed, setCollapsed] = useState(true);
  const [businessList, setBusinessList] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState(null);

  // Obtener negocios
  const fetchBusinesses = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/business");
      setBusinessList(res.data);
    } catch (err) {
      console.error("Error al cargar negocios:", err);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  // Cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem("adminData");
    window.location.href = "/auth";
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* 🔹 Menú lateral */}
      <aside
        className={`${
          collapsed ? "w-16" : "w-64"
        } bg-white shadow-lg transition-all duration-300 flex flex-col`}
        onMouseEnter={() => setCollapsed(false)}
        onMouseLeave={() => setCollapsed(true)}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b">
          {!collapsed && (
            <h2 className="text-lg font-bold text-purple-700">
              Tienda-Express
            </h2>
          )}
          <Menu className="text-gray-500" size={20} />
        </div>

        <nav className="flex-1 py-4 space-y-2">
          <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" collapsed={collapsed} />
          <NavItem icon={<Store size={20} />} label="Negocios" collapsed={collapsed} />
          <NavItem icon={<Users size={20} />} label="Usuarios" collapsed={collapsed} />
          <NavItem icon={<Settings size={20} />} label="Configuración" collapsed={collapsed} />
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 text-red-600 hover:bg-red-50 p-3 m-2 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
      </aside>

      {/* 🔹 Contenido principal */}
      <main className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold text-gray-700 mb-6">
          Panel de Administración
        </h1>

        <BusinessForm
          selectedBusiness={selectedBusiness}
          onSave={fetchBusinesses}
        />

        {/* Listado de negocios */}
        <div className="mt-10">
          <h3 className="font-semibold mb-4 text-gray-700">
            Negocios registrados
          </h3>
          <ul className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {businessList.map((biz) => (
              <li
                key={biz._id}
                onClick={() => setSelectedBusiness(biz)}
                className="bg-white rounded-xl p-4 shadow hover:shadow-md transition cursor-pointer border border-gray-100"
              >
                <p className="font-medium text-gray-800">{biz.nombre}</p>
                <p className="text-sm text-gray-500">{biz.categoria}</p>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}

// 🔸 Subcomponente de item del menú
function NavItem({ icon, label, collapsed }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-purple-50 hover:text-purple-700 cursor-pointer transition-colors">
      {icon}
      {!collapsed && <span className="font-medium">{label}</span>}
    </div>
  );
}
