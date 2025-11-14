// Constantes y utilidades centrales para roles de usuario
export const ROLES = ["admin", "negocio", "empleado", "client"];
export const DEFAULT_ROLE = "admin";

export function isValidRole(r) {
  if (!r) return false;
  return ROLES.includes(r);
}
