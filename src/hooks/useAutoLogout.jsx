import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// Hook simple para cerrar sesión tras inactividad.
// Por defecto se usa 15 minutos (900000 ms). Se resetea al detectar actividad.
export default function useAutoLogout({ timeout = 15 * 60 * 1000 } = {}) {
  const navigate = useNavigate();
  const timerRef = useRef(null);

  useEffect(() => {
    function clearTimer() {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }

    function startTimer() {
      clearTimer();
      timerRef.current = setTimeout(() => {
        // perform logout: clear auth storage and redirect to /auth
        localStorage.removeItem("adminData");
        localStorage.removeItem("userData");
        localStorage.removeItem("token");
        // optional: clear other session keys
        navigate("/auth", { replace: true });
      }, timeout);
    }

    function resetTimer() {
      startTimer();
    }

    const events = ["mousemove", "mousedown", "keydown", "touchstart", "click"];
    events.forEach((evt) => window.addEventListener(evt, resetTimer));

    // iniciar
    startTimer();

    return () => {
      clearTimer();
      events.forEach((evt) => window.removeEventListener(evt, resetTimer));
    };
  }, [navigate, timeout]);
}
