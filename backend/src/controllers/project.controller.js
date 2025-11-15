import Project from "../models/Project.js";

// Crear un nuevo proyecto (cliente autenticado)
export const createProject = async (req, res) => {
  try {
    const { name, description, stories = [] } = req.body;
    if (!name || name.trim() === "") return res.status(400).json({ message: "El nombre del proyecto es obligatorio" });

    const normalizedStories = Array.isArray(stories)
      ? stories.map((s) => ({
          title: s.title || "",
          description: s.description || "",
          acceptance: s.acceptance || "",
          status: s.status || "pending",
        }))
      : [];

    const project = await Project.create({
      name: name.trim(),
      description: description || "",
      client: req.user._id,
      stories: normalizedStories,
    });

    // Re-fetch and compute progress
    const savedDoc = await Project.findById(project._id).populate("client", "nombre email");
    const saved = savedDoc ? savedDoc.toObject() : null;
    if (saved) {
      const total = saved.stories ? saved.stories.length : 0;
      const done = saved.stories ? saved.stories.filter((s) => s.status === "done").length : 0;
      saved.progress = total ? Math.round((done / total) * 100) : 0;
    }
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al crear proyecto" });
  }
};

// Listar proyectos del cliente autenticado
export const listMyProjects = async (req, res) => {
  try {
    const projectsDocs = await Project.find({ client: req.user._id }).sort({ createdAt: -1 });
    const projects = projectsDocs.map((p) => {
      const obj = p.toObject();
      const total = obj.stories ? obj.stories.length : 0;
      const done = obj.stories ? obj.stories.filter((s) => s.status === "done").length : 0;
      obj.progress = total ? Math.round((done / total) * 100) : 0;
      return obj;
    });
    res.json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener proyectos" });
  }
};

// Obtener un proyecto por id (si es propietario o admin)
export const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate("client", "nombre email");
    if (!project) return res.status(404).json({ message: "Proyecto no encontrado" });

    // Si no es admin y no es propietario
    if (req.user.role !== "admin" && project.client._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "No tienes permisos para ver este proyecto" });
    }

    const obj = project.toObject();
    const total = obj.stories ? obj.stories.length : 0;
    const done = obj.stories ? obj.stories.filter((s) => s.status === "done").length : 0;
    obj.progress = total ? Math.round((done / total) * 100) : 0;
    res.json(obj);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener proyecto" });
  }
};

// Obtener proyecto público sin autenticación
export const getPublicProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate("client", "nombre email");
    if (!project) return res.status(404).json({ message: "Proyecto no encontrado" });
    if (!project.isPublic) return res.status(403).json({ message: "Proyecto no público" });

    const obj = project.toObject();
    const total = obj.stories ? obj.stories.length : 0;
    const done = obj.stories ? obj.stories.filter((s) => s.status === "done").length : 0;
    obj.progress = total ? Math.round((done / total) * 100) : 0;
    res.json(obj);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener proyecto público" });
  }
};

// Listar todos los proyectos (admin)
export const listAllProjects = async (req, res) => {
  try {
    const projectsDocs = await Project.find({}).sort({ createdAt: -1 }).populate("client", "nombre email");
    const projects = projectsDocs.map((p) => {
      const obj = p.toObject();
      const total = obj.stories ? obj.stories.length : 0;
      const done = obj.stories ? obj.stories.filter((s) => s.status === "done").length : 0;
      obj.progress = total ? Math.round((done / total) * 100) : 0;
      return obj;
    });
    res.json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al listar proyectos" });
  }
};

// Actualizar un proyecto (owner o admin)
export const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Proyecto no encontrado" });

    if (req.user.role !== "admin" && project.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "No tienes permisos para modificar este proyecto" });
    }

    const { name, description, isPublic, stories } = req.body;
    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (typeof isPublic === "boolean") project.isPublic = isPublic;

    // Si vienen historias, reemplazamos/actualizamos las historias del proyecto
    if (Array.isArray(stories)) {
      project.stories = stories.map((s) => ({
        title: s.title || "",
        description: s.description || "",
        acceptance: s.acceptance || "",
        status: s.status && ["pending", "done"].includes(s.status) ? s.status : "pending",
      }));
    }

    await project.save();
    const obj = project.toObject();
    const total = obj.stories ? obj.stories.length : 0;
    const done = obj.stories ? obj.stories.filter((s) => s.status === "done").length : 0;
    obj.progress = total ? Math.round((done / total) * 100) : 0;
    res.json(obj);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al actualizar proyecto" });
  }
};

// Eliminar proyecto (owner o admin)
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Proyecto no encontrado" });

    if (req.user.role !== "admin" && project.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "No tienes permisos para eliminar este proyecto" });
    }

    await project.remove();
    res.json({ message: "Proyecto eliminado" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al eliminar proyecto" });
  }
};

// Actualizar una historia dentro de un proyecto (marca como done/pending y editar texto)
export const updateStory = async (req, res) => {
  try {
    const { projectId, storyId } = req.params;
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Proyecto no encontrado" });

    // Permiso: admin o propietario
    if (!req.user || (req.user.role !== "admin" && project.client.toString() !== req.user._id.toString())) {
      return res.status(403).json({ message: "No autorizado" });
    }

    const story = project.stories.id(storyId);
    if (!story) return res.status(404).json({ message: "Historia no encontrada" });

    const { title, description, acceptance, status } = req.body;
    if (title !== undefined) story.title = title;
    if (description !== undefined) story.description = description;
    if (acceptance !== undefined) story.acceptance = acceptance;
    if (status !== undefined && ["pending", "done"].includes(status)) {
      story.status = status;
      story.completedAt = status === "done" ? new Date() : undefined;
    }

    await project.save();
    const obj = project.toObject();
    const total = obj.stories ? obj.stories.length : 0;
    const done = obj.stories ? obj.stories.filter((s) => s.status === "done").length : 0;
    obj.progress = total ? Math.round((done / total) * 100) : 0;
    res.json(obj);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al actualizar historia" });
  }
};

// Sincronizar proyectos enviados desde localStorage (crea los que no existan)
export const syncProjects = async (req, res) => {
  try {
    const { projects = [] } = req.body;
    if (!Array.isArray(projects)) return res.status(400).json({ message: "projects debe ser un array" });

    const created = [];
    for (const p of projects) {
      if (!p.name) continue;
      const newProj = await Project.create({
        name: p.name.trim(),
        description: p.description || "",
        client: req.user._id,
        stories: Array.isArray(p.stories) ? p.stories.map((s) => ({ title: s.title || "", description: s.description || "", acceptance: s.acceptance || "" })) : [],
      });
      created.push(newProj);
    }

    res.json({ created: created.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al sincronizar proyectos" });
  }
};
