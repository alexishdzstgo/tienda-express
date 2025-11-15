import Sidebar from "../components/Sidebar";
import { PlusCircle, Folder, Bell, User } from "lucide-react";
import ClientCreate from "./ClientCreate";
import ClientProjects from "./ClientProjects";
import ClientNotifications from "./ClientNotifications";
import ClientProfile from "./ClientProfile";
import { useState } from "react";

export default function ClientDashboard() {
  const [view, setView] = useState("proyectos");

  // Cerrar sesión para clientes: limpiar localStorage y redirigir
  const handleLogout = () => {
    try { localStorage.removeItem("userData"); } catch (e) {}
    window.location.href = "/auth";
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar
        logo="Mi espacio"
        items={[
          { key: "crear", icon: <PlusCircle size={20} />, label: "Crear" },
          { key: "proyectos", icon: <Folder size={20} />, label: "Proyectos" },
          { key: "notificaciones", icon: <Bell size={20} />, label: "Notificaciones" },
          { key: "perfil", icon: <User size={20} />, label: "Perfil" },
        ]}
        selectedKey={view}
        onSelect={(it) => {
          if (it?.key) setView(it.key);
        }}
        onLogout={handleLogout}
      />

      <main className="flex-1 p-8">
        <h1 className="text-2xl font-semibold mb-6">Mi espacio</h1>

        {/* Renderizar la vista elegida dentro del dashboard del cliente */}
        {view === "proyectos" && <ClientProjects />}

        {view === "crear" && <ClientCreate onCreated={() => setView('proyectos')} />}
        {view === "notificaciones" && <ClientNotifications />}
        {view === "perfil" && <ClientProfile />}
      </main>
    </div>
  );
}
