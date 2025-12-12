// src/routes/notification.routes.js
import { Router } from "express";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";
import { getNotifications, markNotification, resendNotification } from "../controllers/notification.controller.js";
import { param, body, validationResult } from "express-validator";

const router = Router();
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  return next();
};

// Listar notificaciones de WhatsApp
// GET /api/notifications?enviado=false&limit=50
router.get(
  "/", 
  requireAuth, 
  requireRole("administrador", "odontologo", "auxiliar"), 
  getNotifications
);

// Marcar notificación manualmente
// PUT /api/notifications/:id
router.put(
  "/:id", 
  requireAuth, 
  requireRole("administrador"), 
  param("id").isInt().toInt(), 
  body("enviado").isBoolean().optional(), 
  handleValidation, 
  markNotification
);

// Reenviar notificación de WhatsApp
// POST /api/notifications/:id/resend
router.post(
  "/:id/resend",
  requireAuth,
  requireRole("administrador", "odontologo"),
  param("id").isInt().toInt(),
  handleValidation,
  resendNotification
);

export default router;
