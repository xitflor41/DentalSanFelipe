// src/routes/users.routes.js
import { Router } from "express";
import { 
  getUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser,
  getCurrentUser 
} from "../controllers/user.controller.js";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";

const router = Router();

// Todas las rutas requieren autenticación
router.use(requireAuth);

// Ruta pública para usuario actual
router.get("/me", getCurrentUser);

// Rutas protegidas por rol
router.get("/", requireRole("administrador"), getUsers);
router.get("/:id", requireRole("administrador"), getUserById);
router.post("/", requireRole("administrador"), createUser);
router.put("/:id", requireRole("administrador"), updateUser);
router.delete("/:id", requireRole("administrador"), deleteUser);

export default router;