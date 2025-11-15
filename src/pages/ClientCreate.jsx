import { useState } from "react";
import api from "../services/api";

function emptyStory() {
  return { id: Date.now() + Math.random(), title: "", description: "", acceptance: "", status: "pending" };
}

export default function ClientCreate({ onCreated } = {}) {
  const [step, setStep] = useState("details"); // details | stories
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [stories, setStories] = useState([]);
  const [saving, setSaving] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);

  const addStory = () => setStories((s) => [...s, emptyStory()]);
  const removeStory = (id) => setStories((s) => s.filter((st) => st.id !== id));
  const updateStory = (id, patch) => setStories((s) => s.map((st) => (st.id === id ? { ...st, ...patch } : st)));

  // Paso 1: crear proyecto con nombre y descripción
  const createDetails = async () => {
    if (!name.trim()) return alert("El proyecto necesita un nombre.");
    setSaving(true);

    const payload = { name: name.trim(), description: description.trim() };

    let token;
    try {
      const ud = localStorage.getItem("userData");
      const ad = localStorage.getItem("adminData");
      const rawToken = localStorage.getItem("token");
      const parsed = ud ? JSON.parse(ud) : ad ? JSON.parse(ad) : null;
      token = parsed?.token || parsed?.access_token || rawToken || null;
    } catch (e) {
      token = localStorage.getItem("token");
    }

    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await api.post("/projects", payload, { headers });
      const project = res.data;
      setCurrentProject(project);
      setStories((project.stories || []).map((s) => ({ id: s._id || Date.now() + Math.random(), title: s.title, description: s.description, acceptance: s.acceptance, status: s.status || 'pending' })));
      setStep("stories");
      setSaving(false);
    } catch (err) {
      console.warn("No se pudo crear en backend, guardando localmente:", err);
      // Fallback a localStorage
      const project = {
        id: Date.now().toString(),
        name: name.trim(),
        description: description.trim(),
        stories: [],
        createdAt: new Date().toISOString(),
      };
      const raw = localStorage.getItem("clientProjects");
      const list = raw ? JSON.parse(raw) : [];
      list.unshift(project);
      localStorage.setItem("clientProjects", JSON.stringify(list));
      setCurrentProject(project);
      setStories([]);
      setStep("stories");
      setSaving(false);
    }
  };

  // Paso 2: guardar historias en el proyecto existente
  const saveStories = async () => {
    if (!currentProject) return alert("Proyecto no encontrado.");
    if (stories.length === 0) return alert("Añade al menos una historia.");
    setSaving(true);

    const payloadStories = stories.filter((s) => s.title && s.title.trim()).map((s) => ({ title: s.title.trim(), description: s.description?.trim() || "", acceptance: s.acceptance?.trim() || "" }));

    // If backend id exists use it, otherwise update localStorage
    const projectId = currentProject._id || currentProject.id;

    // token
    let token;
    try {
      const ud = localStorage.getItem("userData");
      const ad = localStorage.getItem("adminData");
      const rawToken = localStorage.getItem("token");
      const parsed = ud ? JSON.parse(ud) : ad ? JSON.parse(ad) : null;
      token = parsed?.token || parsed?.access_token || rawToken || null;
    } catch (e) {
      token = localStorage.getItem("token");
    }

    try {
      if (projectId && (currentProject._id || token)) {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await api.put(`/projects/${projectId}`, { stories: payloadStories }, { headers });
        const updated = res.data;
        setSaving(false);
        alert("Historias guardadas correctamente.");
        if (onCreated) onCreated(updated);
      } else {
        // local update
        const raw = localStorage.getItem("clientProjects");
        const list = raw ? JSON.parse(raw) : [];
        const idx = list.findIndex((p) => (p.id || p._id) === projectId);
        if (idx >= 0) {
          list[idx].stories = payloadStories;
          localStorage.setItem("clientProjects", JSON.stringify(list));
        }
        setSaving(false);
        alert("Historias guardadas localmente.");
        if (onCreated) onCreated(list[idx] || currentProject);
      }
    } catch (err) {
      console.error("Error guardando historias:", err);
      setSaving(false);
      alert("No se pudo guardar las historias. Intenta sincronizar más tarde.");
    }
  };

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-semibold mb-4">Crear proyecto</h1>

      {step === "details" && (
        <div className="bg-white p-6 rounded shadow space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre del proyecto</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full border border-gray-200 rounded px-3 py-2"
              placeholder="Ej. Tienda móvil"
            />
            <p className="text-xs text-gray-500 mt-1">Pon un nombre breve y claro. Esto ayudará a identificar el proyecto en tu panel.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Descripción</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full border border-gray-200 rounded px-3 py-2"
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">Describe en pocas palabras qué esperas que haga la aplicación. No necesitas términos técnicos.</p>
          </div>

          <div className="flex items-center gap-3 justify-end">
            <button onClick={() => { setName(""); setDescription(""); }} type="button" className="px-4 py-2 border rounded">Limpiar</button>
            <button onClick={createDetails} type="button" className="px-4 py-2 bg-purple-600 text-white rounded">{saving ? 'Creando...' : 'Crear proyecto'}</button>
          </div>
        </div>
      )}

      {step === "stories" && currentProject && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded shadow">
            <h2 className="font-semibold text-lg">{currentProject.name}</h2>
            <p className="text-sm text-gray-600">{currentProject.description}</p>
            <div className="text-xs text-gray-500 mt-2">Progreso actual: {currentProject.progress ?? 0}%</div>
          </div>

          <div className="bg-white p-6 rounded shadow">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Historias de usuario</h3>
              <button onClick={addStory} type="button" className="text-sm text-purple-600">+ Añadir historia</button>
            </div>

            <p className="text-xs text-gray-500 mt-2">Cada historia debe describir una funcionalidad concreta. Los criterios de aceptación ayudan a saber cuándo queda completa.</p>

            <div className="mt-3 space-y-3">
              {stories.map((st, idx) => (
                <div key={st.id} className="border border-gray-100 rounded p-3 bg-gray-50">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <input
                        value={st.title}
                        onChange={(e) => updateStory(st.id, { title: e.target.value })}
                        className="block w-full border border-gray-200 rounded px-2 py-1"
                        placeholder={`Título de la historia #${idx + 1}`}
                      />
                      <textarea
                        value={st.description}
                        onChange={(e) => updateStory(st.id, { description: e.target.value })}
                        className="mt-2 block w-full border border-gray-200 rounded px-2 py-1"
                        rows={2}
                        placeholder="Descripción breve"
                      />
                      <input
                        value={st.acceptance}
                        onChange={(e) => updateStory(st.id, { acceptance: e.target.value })}
                        className="mt-2 block w-full border border-gray-200 rounded px-2 py-1"
                        placeholder="Criterios de aceptación (separados por comas)"
                      />
                    </div>

                    <div className="flex-shrink-0 ml-2">
                      <button onClick={() => removeStory(st.id)} type="button" className="text-sm text-red-600">Eliminar</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 justify-end mt-4">
              <button onClick={() => { setStories([]); }} type="button" className="px-4 py-2 border rounded">Limpiar</button>
              <button onClick={saveStories} type="button" className="px-4 py-2 bg-purple-600 text-white rounded">{saving ? 'Guardando...' : 'Guardar historias'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
