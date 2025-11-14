import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRegister from "./pages/AdminRegister";
import OAuthCallback from "./pages/OAuthCallback";
import PrivateRoute from "./components/PrivateRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/admin/register"
          element={
            <PrivateRoute>
              <AdminRegister />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/*"
          element={
            <PrivateRoute>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route path="/auth/callback" element={<OAuthCallback />} />
      </Routes>
    </BrowserRouter>
  );
}
