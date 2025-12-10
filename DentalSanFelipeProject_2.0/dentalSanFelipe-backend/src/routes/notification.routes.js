// src/routes/notification.routes.js
import { Router } from "express";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";
import { getNotifications, markNotification } from "../controllers/notification.controller.js";
import { param, body, validationResult } from "express-validator";

const router = Router();
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  return next();
};

router.get("/", requireAuth, requireRole("administrador", "odontologo"), getNotifications);
router.put("/:id", requireAuth, requireRole("administrador"), param("id").isInt().toInt(), body("enviado").isBoolean().optional(), handleValidation, markNotification);

export default router;
