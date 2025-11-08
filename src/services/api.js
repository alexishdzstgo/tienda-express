// src/services/api.js
import axios from "axios";

const api = axios.create({
  /* baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api", // Ajusta según tu backend */
    baseURL: "http://localhost:5000/api/",

  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor opcional para loguear errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("❌ Error en petición Axios:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
