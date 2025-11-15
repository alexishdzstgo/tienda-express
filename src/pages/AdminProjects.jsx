import { useEffect, useState } from "react";
import api from "../services/api";

export default function AdminProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function fetchAll() {
      try {
        const token = (() => {
          try {
            const ad = localStorage.getItem("adminData");
            return ad ? JSON.parse(ad).token || JSON.parse(ad).access_token : localStorage.getItem("token");
          } catch { return localStorage.getItem("token"); }
        })();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await api.get("/projects/all", { headers });
        if (!mounted) return;
        setProjects(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchAll();
    return () => (mounted = false);
  }, []);

  const toggleStoryDone = async (projectId, storyId, currentStatus) => {
    try {
      const token = (() => {
        try { const ad = localStorage.getItem("adminData"); return ad ? JSON.parse(ad).token || JSON.parse(ad).access_token : localStorage.getItem("token"); } catch { return localStorage.getItem("token"); }
      })();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await api.patch(`/projects/${projectId}/stories/${storyId}`, { status: currentStatus === "done" ? "pending" : "done" }, { headers });
      // update local state
      setProjects((prev) => prev.map((p) => (p._id === projectId ? res.data : p)));
    } catch (err) {
      console.error(err);
      alert("No se pudo actualizar la historia. Revisa permisos.");
    }
  };

  if (loading) return <div className="p-6">Cargando proyectos...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Proyectos (Admin)</h1>
      {projects.length === 0 ? (
        <div>No hay proyectos.</div>
      ) : (
        <div className="space-y-4">
          {projects.map((p) => (
            <div key={p._id} className="bg-white p-4 rounded shadow">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-lg">{p.name}</div>
                  <div className="text-sm text-gray-600">{p.description}</div>
                  <div className="text-xs text-gray-400">Progreso: {p.progress || 0}%</div>
                </div>
                <div>
                  <a className="text-sm text-purple-600 mr-3" href={`/projects/${p._id}`} target="_blank">Ver pública</a>
                </div>
              </div>

              {p.stories && p.stories.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {p.stories.map((s) => (
                    <li key={s._id} className="flex items-center justify-between border rounded p-2">
                      <div>
                        <div className="font-medium">{s.title}</div>
                        {s.description && <div className="text-sm text-gray-600">{s.description}</div>}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={`text-sm ${s.status === 'done' ? 'text-green-600' : 'text-orange-600'}`}>{s.status}</div>
                        <button onClick={() => toggleStoryDone(p._id, s._id, s.status)} className="text-sm text-blue-600">Toggle</button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
