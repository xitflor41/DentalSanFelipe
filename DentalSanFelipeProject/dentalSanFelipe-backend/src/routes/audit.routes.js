// src/routes/audit.routes.js
import { Router } from "express";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";
import {
  getAuditByExpediente,
  getRecentAudit,
  getAuditStats,
  createAuditLog
} from "../controllers/audit.controller.js";

const router = Router();

// Obtener historial de auditoría de un expediente específico
// GET /api/audit/expediente/:id?page=1&limit=50
router.get(
  "/expediente/:id",
  requireAuth,
  requireRole("administrador", "odontologo"),
  getAuditByExpediente
);

// Obtener logs recientes (todos los expedientes)
// GET /api/audit/recent?limit=20&accion=CREAR_EXPEDIENTE&id_usuario=1
router.get(
  "/recent",
  requireAuth,
  requireRole("administrador"),
  getRecentAudit
);

// Obtener estadísticas de auditoría
// GET /api/audit/stats?dias=30
router.get(
  "/stats",
  requireAuth,
  requireRole("administrador"),
  getAuditStats
);

// Crear log de auditoría manual
// POST /api/audit/log
router.post(
  "/log",
  requireAuth,
  requireRole("administrador"),
  createAuditLog
);

export default router;
