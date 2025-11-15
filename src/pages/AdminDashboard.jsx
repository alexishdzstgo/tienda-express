import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
import AdminRegisterForm from "../components/AdminRegisterForm";
import Sidebar from "../components/Sidebar";

export default function AdminDashboard() {
  const hoverTimeoutRef = useRef(null);
  const [businessList, setBusinessList] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [view, setView] = useState("dashboard"); // dashboard | negocios | usuarios | configuracion | crearAdministrador
  const navigate = useNavigate();
  const location = useLocation();

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

  // Sincronizar `view` con la ruta (deep-linking)
  useEffect(() => {
    const path = location.pathname.replace(/\/+$/, ""); // quitar slash final
    if (path === "/admin" || path === "/admin/") {
      // si hay una vista guardada en localStorage la usamos
      const saved = typeof window !== "undefined" ? localStorage.getItem("adminView") : null;
      if (saved) setView(saved);
      else setView("dashboard");
      return;
    }

    if (path.startsWith("/admin/negocios")) setView("negocios");
    else if (path.startsWith("/admin/usuarios")) setView("usuarios");
    else if (path.startsWith("/admin/configuracion")) setView("configuracion");
    else if (path.startsWith("/admin/crear-administrador") || path.startsWith("/admin/register")) setView("crearAdministrador");
    else setView("dashboard");
  }, [location.pathname]);

  // Cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem("adminData");
    window.location.href = "/auth";
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        logo="Tienda-Express"
        items={[
          { key: "dashboard", icon: <LayoutDashboard size={20} />, label: "Dashboard", to: "/admin" },
          { key: "negocios", icon: <Store size={20} />, label: "Negocios", to: "/admin/negocios" },
          { key: "usuarios", icon: <Users size={20} />, label: "Usuarios", to: "/admin/usuarios" },
          { key: "configuracion", icon: <Settings size={20} />, label: "Configuración", to: "/admin/configuracion" },
          { key: "crearAdministrador", icon: <Users size={18} />, label: "Crear administrador", to: "/admin/crear-administrador" },
        ]}
        selectedKey={view}
        onSelect={(it) => {
          setView(it.key);
          try { localStorage.setItem("adminView", it.key); } catch(e) {}
          navigate(it.to || "/admin");
        }}
        onLogout={handleLogout}
      />

      {/* 🔹 Contenido principal */}
      <main className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold text-gray-700 mb-6">Panel de Administración</h1>

        {/* Vista principal controlada por `view` */}
        {view === "dashboard" && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <BusinessForm selectedBusiness={selectedBusiness} onSave={fetchBusinesses} />
              </div>
              <div>
                <div className="bg-white rounded-lg shadow p-4 max-w-md w-full">
                  <h3 className="text-lg font-semibold mb-2 text-gray-700">Resumen</h3>
                  <p className="text-sm text-gray-600">Accede a las acciones del menú para ver o editar contenido aquí.</p>
                </div>
              </div>
            </div>

            {/* Listado de negocios */}
            <div className="mt-10">
              <h3 className="font-semibold mb-4 text-gray-700">Negocios registrados</h3>
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
          </>
        )}

        {view === "negocios" && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Negocios</h2>
            <BusinessForm selectedBusiness={selectedBusiness} onSave={fetchBusinesses} />
            <div className="mt-8">
              <h3 className="font-semibold mb-4 text-gray-700">Negocios registrados</h3>
              <ul className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {businessList.map((biz) => (
                  <li key={biz._id} className="bg-white rounded-xl p-4 shadow border border-gray-100">
                    <p className="font-medium text-gray-800">{biz.nombre}</p>
                    <p className="text-sm text-gray-500">{biz.categoria}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {view === "usuarios" && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Usuarios</h2>
            <p className="text-sm text-gray-600">Aquí aparecerá la gestión de usuarios (lista, roles, permisos).</p>
          </div>
        )}

        {view === "configuracion" && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Configuración</h2>
            <p className="text-sm text-gray-600">Opciones de configuración del panel.</p>
          </div>
        )}

        {view === "crearAdministrador" && (
          <div className="max-w-3xl">
            <AdminRegisterForm />
          </div>
        )}
      </main>
    </div>
  );
}

// 🔸 Subcomponente de item del menú
function NavItem({ icon, label, collapsed, to, onClick, active }) {
  const base = `flex items-center gap-3 px-4 py-2 cursor-pointer transition-colors`;
  const colorClass = active ? "bg-purple-50 text-purple-700" : "text-gray-600 hover:bg-purple-50 hover:text-purple-700";

  const content = (
    <div
      onClick={onClick}
      role="button"
      aria-pressed={active}
      aria-current={active ? "true" : undefined}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick && onClick();
      }}
      className={`${base} ${colorClass}`}
    >
      {icon}
      <AnimatePresence>
        {!collapsed && (
          <motion.span
            key="label"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.18 }}
            className="font-medium truncate"
            title={label}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="block" aria-label={label}>
        {content}
      </Link>
    );
  }

  return content;
}
