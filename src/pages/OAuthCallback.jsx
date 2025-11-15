import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

// Página que procesa el callback OAuth. Soporta dos modos:
// 1) Backend redirige con ?token=...&role=... (el frontend guarda y notifica al opener)
// 2) Backend redirige con ?code=... (el frontend intenta intercambiarlo con el backend)
export default function OAuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const qs = new URLSearchParams(window.location.search);
        const token = qs.get("token");
        const role = qs.get("role") || "client";
        const code = qs.get("code");
        const userJson = qs.get("user"); // opcional

        let payload = {};

        if (code) {
          // Intentar intercambiar el código en el backend. Endpoint recomendado: POST /api/auth/exchange
          try {
            const res = await api.post("/auth/exchange", { code });
            payload = res.data;
          } catch (err) {
            console.warn("Intercambio de código falló, revisa backend:", err);
          }
        }

        if (token) payload = { ...(payload || {}), token, role };
        if (userJson) {
          try {
            payload.user = JSON.parse(decodeURIComponent(userJson));
          } catch (e) {
            // ignore parse errors
          }
        }

        // Guardar en localStorage como fallback
        if (payload?.token) {
          if (payload.role === "admin" || role === "admin") {
            localStorage.setItem("adminData", JSON.stringify(payload));
            // si no hay opener, redirigir admin al dashboard
            if (!window.opener) navigate("/admin");
          } else {
            localStorage.setItem("userData", JSON.stringify(payload));
            if (!window.opener) navigate("/me");
          }
        }

        // Notificar a la ventana que abrió el popup (si existe)
        if (window.opener) {
          window.opener.postMessage({ type: "oauth_success", data: payload }, window.location.origin);
          window.close();
        }
      } catch (err) {
        console.error("Error procesando callback OAuth:", err);
        navigate("/auth");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-6">
      <div className="max-w-xl mx-auto text-center">
        <p className="text-gray-600">Procesando inicio de sesión... Si no sucede nada, cierra esta ventana y vuelve a intentar.</p>
      </div>
    </div>
  );
}
