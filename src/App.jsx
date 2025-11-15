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
import ClientCreate from "./pages/ClientCreate";
import ClientProjects from "./pages/ClientProjects";
import ClientNotifications from "./pages/ClientNotifications";
import ClientProfile from "./pages/ClientProfile";

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
        <Route path="/me" element={<ClientDashboard />} />
        <Route path="/me/create" element={<ClientCreate />} />
        <Route path="/me/projects" element={<ClientProjects />} />
        <Route path="/me/notifications" element={<ClientNotifications />} />
        <Route path="/me/profile" element={<ClientProfile />} />
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
