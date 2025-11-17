import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRegister from "./pages/AdminRegister";
import AdminProjects from "./pages/AdminProjects";
import ClientDashboard from "./pages/ClientDashboard";
import ProjectPublic from "./pages/ProjectPublic";
import OAuthCallback from "./pages/OAuthCallback";
import PrivateRoute from "./components/PrivateRoute";
import useAutoLogout from "./hooks/useAutoLogout";
import ClientCreate from "./pages/ClientCreate";
import ClientProjects from "./pages/ClientProjects";
import ClientNotifications from "./pages/ClientNotifications";
import ClientProfile from "./pages/ClientProfile";

export default function App() {
  return (
    <BrowserRouter>
      {/* AutoLogout se monta dentro del Router para que useNavigate esté disponible */}
      <AutoLogoutManager />
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
        <Route
          path="/me"
          element={
            <PrivateRoute requireClient>
              <ClientDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/me/create"
          element={
            <PrivateRoute requireClient>
              <ClientCreate />
            </PrivateRoute>
          }
        />
        <Route
          path="/me/projects"
          element={
            <PrivateRoute requireClient>
              <ClientProjects />
            </PrivateRoute>
          }
        />
        <Route
          path="/me/notifications"
          element={
            <PrivateRoute requireClient>
              <ClientNotifications />
            </PrivateRoute>
          }
        />
        <Route
          path="/me/profile"
          element={
            <PrivateRoute requireClient>
              <ClientProfile />
            </PrivateRoute>
          }
        />
        <Route path="/projects/:id" element={<ProjectPublic />} />
        <Route
          path="/admin/projects"
          element={
            <PrivateRoute>
              <AdminProjects />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

function AutoLogoutManager() {
  // Hook que necesita el contexto del Router (useNavigate)
  useAutoLogout({ timeout: 15 * 60 * 1000 });
  return null;
}
