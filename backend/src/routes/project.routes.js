import express from "express";
import { proteger, soloAdmin } from "../middleware/auth.js";
import {
	createProject,
	listMyProjects,
	getProject,
	getPublicProject,
	updateStory,
	updateProject,
	deleteProject,
	listAllProjects,
	syncProjects,
} from "../controllers/project.controller.js";

const router = express.Router();

// Crear proyecto (cliente autenticado)
router.post("/", proteger, createProject);

// Listar proyectos del usuario autenticado
router.get("/", proteger, listMyProjects);

// Listar todos (admin)
router.get("/all", proteger, soloAdmin, listAllProjects);

// Obtener proyecto por id (owner/admin)
router.get("/:id", proteger, getProject);

// Obtener proyecto público (sin auth) — solo si isPublic true
router.get("/public/:id", getPublicProject);

// Actualizar proyecto (owner/admin)
router.put("/:id", proteger, updateProject);

// Eliminar proyecto (owner/admin)
router.delete("/:id", proteger, deleteProject);

// Actualizar una historia (por admin o propietario)
router.patch("/:projectId/stories/:storyId", proteger, updateStory);

// Sincronizar proyectos locales del cliente (envía array de proyectos)
router.post("/sync", proteger, syncProjects);

export default router;
