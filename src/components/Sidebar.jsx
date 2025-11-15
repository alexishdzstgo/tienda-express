import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import Tooltip from "./Tooltip";
import { Menu, Pin, PinOff, LogOut } from "lucide-react";

export default function Sidebar({ items = [], selectedKey, onSelect, logo = "Tienda-Express", onLogout }) {
  const [collapsed, setCollapsed] = useState(true);
  const [pinned, setPinned] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("sidebarPinned") === "1" : false
  );
  const hoverTimeoutRef = useRef(null);

  useEffect(() => {
    if (pinned) setCollapsed(false);
  }, [pinned]);

  return (
    <aside
      className={`${collapsed ? "w-16" : "w-64"} bg-white shadow-lg transition-all duration-300 flex flex-col overflow-hidden`}
      onMouseEnter={() => {
        if (!pinned) {
          if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
          setCollapsed(false);
        }
      }}
      onMouseLeave={() => {
        if (!pinned) {
          if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
          hoverTimeoutRef.current = setTimeout(() => setCollapsed(true), 220);
        }
      }}
    >
      <div className="flex items-center justify-between px-4 py-4 border-b flex-nowrap">
        {!collapsed && (
          <h2 className="text-lg font-bold text-purple-700 whitespace-nowrap truncate">{logo}</h2>
        )}

        <div className="flex items-center gap-2">
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
        {items.map((it) => (
          <NavItem
            key={it.key}
            icon={it.icon}
            label={it.label}
            collapsed={collapsed}
            active={selectedKey === it.key}
            onClick={() => onSelect && onSelect(it)}
            to={it.to}
          />
        ))}
      </nav>

      {onLogout && (
        <button
          onClick={onLogout}
          className="flex items-center gap-3 text-red-600 hover:bg-red-50 p-3 m-2 rounded-lg transition-colors"
        >
          <LogOut size={18} />
          {!collapsed && <span className="text-red-600">Cerrar sesión</span>}
        </button>
      )}
    </aside>
  );
}

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
