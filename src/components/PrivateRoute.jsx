import React from "react";
import { Navigate } from "react-router-dom";

/**
 * PrivateRoute: componente envoltorio para rutas protegidas.
 * - Comprueba si hay `adminData` en localStorage (ajustar según tu auth real).
 * - Si el usuario no está autenticado, redirige a `/auth`.
 * - Si está autenticado, renderiza el elemento hijo.
 */
export default function PrivateRoute({ children }) {
  // Nota: en una app real, validar token/expiración o usar contexto/global store
  const adminData = localStorage.getItem("adminData");
  if (!adminData) {
    return <Navigate to="/auth" replace />;
  }
  return children;
}
