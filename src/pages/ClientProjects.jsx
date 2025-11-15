import { useEffect, useState } from "react";
import api from "../services/api";

export default function ClientProjects() {
  const [projects, setProjects] = useState([]);

  const handleSync = async () => {
    try {
      const raw = localStorage.getItem("clientProjects");
      if (!raw) return alert("No hay proyectos locales pendientes.");
      const list = JSON.parse(raw);
      const ud = localStorage.getItem("userData");
      const parsed = ud ? JSON.parse(ud) : null;
      const token = parsed?.token || parsed?.access_token || localStorage.getItem("token") || null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await api.post("/projects/sync", { projects: list }, { headers });
      alert(`Proyectos sincronizados: ${res.data.created}`);
      localStorage.removeItem("clientProjects");
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("No se pudo sincronizar. Asegúrate de estar autenticado.");
    }
  };

  const togglePublic = async (proj) => {
    try {
      const ud = localStorage.getItem("userData");
      const parsed = ud ? JSON.parse(ud) : null;
      const token = parsed?.token || parsed?.access_token || localStorage.getItem("token") || null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      if (proj._id) {
        await api.put(`/projects/${proj._id}`, { isPublic: !proj.isPublic }, { headers });
      } else {
        // local-only project: toggle in localStorage
        const raw = localStorage.getItem("clientProjects");
        const list = raw ? JSON.parse(raw) : [];
        const idx = list.findIndex((p) => (p.id || p._id) === (proj.id || proj._id));
        if (idx >= 0) {
          list[idx].isPublic = !list[idx].isPublic;
          localStorage.setItem("clientProjects", JSON.stringify(list));
          setProjects(list);
          return;
        }
      }
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('No se pudo actualizar la visibilidad.');
    }
  };

  const deleteProject = async (proj) => {
    if (!confirm('Eliminar proyecto?')) return;
    try {
      // If project has _id => call backend (requires auth)
      if (proj._id) {
        const ud = localStorage.getItem("userData");
        const parsed = ud ? JSON.parse(ud) : null;
        const token = parsed?.token || parsed?.access_token || localStorage.getItem("token") || null;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        await api.delete(`/projects/${proj._id}`, { headers });
        alert('Proyecto eliminado');
        window.location.reload();
        return;
      }

      // Local-only project: remove from localStorage and update state
      const raw = localStorage.getItem("clientProjects");
      const list = raw ? JSON.parse(raw) : [];
      const filtered = list.filter((p) => (p.id || p._id) !== (proj.id || proj._id));
      localStorage.setItem("clientProjects", JSON.stringify(filtered));
      setProjects((prev) => prev.filter((p) => (p.id || p._id) !== (proj.id || proj._id)));
      alert('Proyecto local eliminado');
    } catch (err) {
      console.error(err);
      alert('No se pudo eliminar el proyecto.');
    }
  };

  useEffect(() => {
    let mounted = true;
    async function fetchProjects() {
      try {
        // obtener token
        const ud = localStorage.getItem("userData");
        const ad = localStorage.getItem("adminData");
        const rawToken = localStorage.getItem("token");
        const parsed = ud ? JSON.parse(ud) : ad ? JSON.parse(ad) : null;
        const token = parsed?.token || parsed?.access_token || rawToken || null;

        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await api.get("/projects", { headers });
        if (!mounted) return;
        setProjects(res.data || []);
      } catch (err) {
        console.warn("No se pudo cargar proyectos desde backend, usando localStorage", err);
        try {
          const raw = localStorage.getItem("clientProjects");
          if (!mounted) return;
          setProjects(raw ? JSON.parse(raw) : []);
        } catch (e) {
          console.error(e);
          if (!mounted) return;
          setProjects([]);
        }
      }
    }

    fetchProjects();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-4">Proyectos</h1>

      <div className="mb-4">
        <button onClick={handleSync} className="px-3 py-2 bg-green-600 text-white rounded">Sincronizar proyectos locales</button>
      </div>

      {projects.length === 0 ? (
        <p className="text-sm text-gray-600">Aún no tienes proyectos. Crea uno en la sección "Crear".</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {projects.map((p) => (
            <div key={p._id || p.id} className="bg-white rounded shadow p-4 border border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{p.name}</h3>
                  <p className="text-sm text-gray-600">{p.description}</p>
                  <p className="text-xs text-gray-400 mt-2">Creado: {new Date(p.createdAt).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Progreso: {p.progress ?? 0}%</div>
                  <div className="flex items-center gap-2 justify-end">
                    <a className="text-sm text-purple-600" href={`${window.location.origin}/projects/${p._id || p.id}`} target="_blank" rel="noreferrer">Ver en tiempo real</a>
                    {!p._id && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">No sincronizado</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between gap-4">
                <div className="text-sm text-gray-600">Progreso:</div>
                <div className="flex-1">
                  <div className="w-full bg-gray-200 rounded h-3 overflow-hidden">
                    <div
                      className="bg-purple-600 h-3"
                      style={{ width: `${p.progress ?? 0}%` }}
                      aria-valuenow={p.progress ?? 0}
                    />
                  </div>
                </div>
                <div className="text-sm font-medium text-gray-700 w-12 text-right">{p.progress ?? 0}%</div>
              </div>

              {p.stories && p.stories.length > 0 && (
                <div className="mt-3">
                  <h4 className="font-medium">Historias ({p.stories.length})</h4>
                  <ul className="mt-2 space-y-2 text-sm">
                    {p.stories.map((s) => (
                      <li key={s.id} className="border-t pt-2">
                        <div className="font-medium">{s.title}</div>
                        {s.description && <div className="text-gray-600">{s.description}</div>}
                        {s.acceptance && <div className="text-gray-500 text-xs mt-1">Criterios: {s.acceptance}</div>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="mt-3 flex gap-2">
                <button onClick={() => togglePublic(p)} className="px-3 py-1 border rounded text-sm">{p.isPublic ? 'Hacer privado' : 'Hacer público'}</button>
                <button onClick={() => deleteProject(p)} className="px-3 py-1 border rounded text-sm text-red-600">Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
