import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

export default function ProjectPublic() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function fetchProject() {
      try {
        const res = await api.get(`/projects/public/${id}`);
        if (!mounted) return;
        setProject(res.data);
      } catch (err) {
        console.error(err);
        if (!mounted) return;
        setError(err.response?.data?.message || "No se pudo cargar el proyecto público.");
      }
    }
    fetchProject();
    return () => (mounted = false);
  }, [id]);

  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!project) return <div className="p-8">Cargando proyecto...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
      <p className="text-sm text-gray-600 mb-4">{project.description}</p>

      <div className="mb-4">
        <div className="w-full bg-gray-200 h-3 rounded overflow-hidden">
          <div className="bg-purple-600 h-3" style={{ width: `${project.progress || 0}%` }} />
        </div>
        <div className="text-xs text-gray-500 mt-1">Progreso: {project.progress || 0}%</div>
      </div>

      <h2 className="text-xl font-semibold mb-2">Historias de usuario</h2>
      {project.stories && project.stories.length > 0 ? (
        <ul className="space-y-3">
          {project.stories.map((s) => (
            <li key={s._id} className="border rounded p-3 bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">{s.title}</div>
                  {s.description && <div className="text-sm text-gray-600">{s.description}</div>}
                  {s.acceptance && <div className="text-xs text-gray-400 mt-1">Criterios: {s.acceptance}</div>}
                </div>
                <div className={`text-sm ${s.status === 'done' ? 'text-green-600' : 'text-orange-600'}`}>{s.status}</div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-sm text-gray-500">Aún no hay historias publicadas.</div>
      )}
    </div>
  );
}
