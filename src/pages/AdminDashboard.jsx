import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Tooltip from "../components/Tooltip";
import axios from "axios";
import {
  LayoutDashboard,
  Store,
  LogOut,
  Settings,
  Users,
  Menu,
  Pin,
  PinOff,
} from "lucide-react";
import BusinessForm from "../components/BusinessForm";
import AdminRegisterForm from "../components/AdminRegisterForm";

export default function AdminDashboard() {
  const [collapsed, setCollapsed] = useState(true);
  const [pinned, setPinned] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("sidebarPinned") === "1" : false
  );
  // Si está fijado (pinned) queremos que la sidebar arranque expandida
  useEffect(() => {
    if (pinned) setCollapsed(false);
  }, [pinned]);
  const [businessList, setBusinessList] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [view, setView] = useState("dashboard"); // dashboard | negocios | usuarios | configuracion | crearAdministrador
  const hoverTimeoutRef = useRef(null);
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
      {/* 🔹 Menú lateral */}
      <aside
        className={`${collapsed ? "w-16" : "w-64"} bg-white shadow-lg transition-all duration-300 flex flex-col overflow-hidden`}
        onMouseEnter={() => {
          // clear pending collapse and expand unless pinned
          if (!pinned) {
            if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
            setCollapsed(false);
          }
        }}
        onMouseLeave={() => {
          if (!pinned) {
            // delay collapse slightly to avoid accidental toggles
            if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = setTimeout(() => setCollapsed(true), 220);
          }
        }}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b flex-nowrap">
          {!collapsed && (
            <h2 className="text-lg font-bold text-purple-700 whitespace-nowrap truncate">
              Tienda-Express
            </h2>
          )}
          <div className="flex items-center gap-2">
            {/* Mostrar el pin SOLO cuando no esté colapsado. Cuando está colapsado
                sólo queremos ver el icono hamburguesa para evitar movimientos. */}
            {!collapsed && (
              <button
                title={pinned ? "Fijar sidebar (activado)" : "Fijar sidebar (desactivado)"}
                onClick={() => {
                  const next = !pinned;
                  setPinned(next);
                  try {
                    localStorage.setItem("sidebarPinned", next ? "1" : "0");
                  } catch (e) {}
                }}
                className={`p-1 rounded ${pinned ? "bg-purple-100 text-purple-700" : "text-gray-500 hover:bg-gray-100"}`}
              >
                {pinned ? <Pin size={16} /> : <PinOff size={16} />}
              </button>
            )}

            <div className="flex-shrink-0">
              {collapsed ? (
                <Tooltip text={"Pasa el cursor para expandir la barra. Fija la barra desde el icono pin una vez expandida."}>
                  <Menu className="text-gray-500" size={20} />
                </Tooltip>
              ) : (
                <Menu className="text-gray-500" size={20} />
              )}
            </div>
          </div>
        </div>

        <nav className="flex-1 py-4 space-y-2">
          <NavItem
            icon={<LayoutDashboard size={20} />}
            label="Dashboard"
            collapsed={collapsed}
            active={view === "dashboard"}
            onClick={() => { setView("dashboard"); localStorage.setItem("adminView", "dashboard"); navigate("/admin"); }}
            to="/admin"
          />
          <NavItem
            icon={<Store size={20} />}
            label="Negocios"
            collapsed={collapsed}
            active={view === "negocios"}
            onClick={() => { setView("negocios"); localStorage.setItem("adminView", "negocios"); navigate("/admin/negocios"); }}
            to="/admin/negocios"
          />
          <NavItem
            icon={<Users size={20} />}
            label="Usuarios"
            collapsed={collapsed}
            active={view === "usuarios"}
            onClick={() => { setView("usuarios"); localStorage.setItem("adminView", "usuarios"); navigate("/admin/usuarios"); }}
            to="/admin/usuarios"
          />
          <NavItem
            icon={<Settings size={20} />}
            label="Configuración"
            collapsed={collapsed}
            active={view === "configuracion"}
            onClick={() => { setView("configuracion"); localStorage.setItem("adminView", "configuracion"); navigate("/admin/configuracion"); }}
            to="/admin/configuracion"
          />
          {/* Opción para crear administrador: muestra el formulario en el área principal */}
          <NavItem
            icon={<Users size={18} />}
            label="Crear administrador"
            collapsed={collapsed}
            active={view === "crearAdministrador"}
            onClick={() => { setView("crearAdministrador"); localStorage.setItem("adminView", "crearAdministrador"); navigate("/admin/crear-administrador"); }}
            to="/admin/crear-administrador"
          />
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
