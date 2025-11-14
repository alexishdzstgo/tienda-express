import api from "./api";

// Pequeña capa que centraliza llamadas relacionadas con autenticación.
// Devuelve promesas para manejar desde componentes.

export async function registerClient(payload) {
  // Usar endpoint dedicado para clientes
  return api.post("/users/register-client", payload);
}

export async function registerAdmin(payload) {
  return api.post("/users/register", { ...payload, role: "admin" });
}

export async function login(payload) {
  return api.post("/users/login", payload);
}

// Abre la URL de OAuth en un popup y espera un postMessage de respuesta.
export function openOAuthPopup(url, { width = 600, height = 700 } = {}) {
  return new Promise((resolve, reject) => {
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    const opts = `width=${width},height=${height},left=${left},top=${top}`;
    const popup = window.open(url, "oauth_popup", opts);

    if (!popup) return reject(new Error("No se pudo abrir la ventana de autenticación"));

    function handler(e) {
      try {
        if (e.source !== popup) return;
        const { data } = e;
        if (data && data.type === "oauth_success") {
          window.removeEventListener("message", handler);
          resolve(data.data);
        }
      } catch (err) {
        window.removeEventListener("message", handler);
        reject(err);
      }
    }

    window.addEventListener("message", handler);

    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        window.removeEventListener("message", handler);
        reject(new Error("Ventana de autenticación cerrada"));
      }
    }, 500);
  });
}
