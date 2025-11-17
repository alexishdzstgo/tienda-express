import React from "react";
import { Navigate } from "react-router-dom";

/**
 * PrivateRoute: componente envoltorio para rutas protegidas.
 * - Comprueba si hay `adminData` en localStorage (ajustar según tu auth real).
 * - Si el usuario no está autenticado, redirige a `/auth`.
 * - Si está autenticado, renderiza el elemento hijo.
 */
export default function PrivateRoute({ children, requireAdmin = false, requireClient = false }) {
  // Nota: en una app real, validar token/expiración o usar contexto/global store
  const rawAdmin = localStorage.getItem("adminData");
  const rawUser = localStorage.getItem("userData");
  const token = localStorage.getItem("token");

  function safeParse(raw) {
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  const adminObj = safeParse(rawAdmin);
  const userObj = safeParse(rawUser);

  function hasTokenValue(t) {
    return typeof t === "string" && t !== "null" && t !== "undefined" && t.trim().length > 0;
  }

  const isAdmin = !!(adminObj && (hasTokenValue(adminObj.token) || hasTokenValue(adminObj.accessToken)));
  const isClient = !!(userObj && (hasTokenValue(userObj.token) || hasTokenValue(userObj.accessToken)));
  const isLoggedIn = isAdmin || isClient || hasTokenValue(token);

  // Debug logs para ayudar a entender por qué no redirige.
  // (Temporal) si estás en producción, puedes eliminar estos logs.
  try {
    // eslint-disable-next-line no-console
    console.debug("PrivateRoute debug:", {
      path: window.location.pathname,
      rawAdmin,
      adminObj,
      rawUser,
      userObj,
      token,
      isAdmin,
      isClient,
      isLoggedIn,
      requireAdmin,
      requireClient,
    });
  } catch (e) {
    // ignore in non-browser env
  }

  if (!isLoggedIn) {
    return <Navigate to="/auth" replace />;
  }

  if (requireAdmin && !isAdmin) {
    // usuario logueado pero no administrador
    return <Navigate to="/auth" replace />;
  }

  if (requireClient && !isClient) {
    // no hay un usuario cliente logueado
    return <Navigate to="/auth" replace />;
  }

  return children;
}
