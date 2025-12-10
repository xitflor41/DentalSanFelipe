// src/routes/record.routes.js
import { Router } from "express";
import { body, param, query, validationResult } from "express-validator";
import {
  getExpedientes,
  getExpedienteById,
  createExpediente,
  updateExpediente,
  deleteExpediente,
  upsertHistoriaClinica,
  createConsulta,
    getConsultasByExpediente,
   getOdontograma,
  updateOdontograma
} from "../controllers/record.controller.js";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";

const router = Router();
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  return next();
};

// Listar
router.get("/", requireAuth, requireRole("administrador", "odontologo", "auxiliar"), query("page").optional().isInt().toInt(), query("limit").optional().isInt().toInt(), handleValidation, getExpedientes);

// Obtener por id
router.get("/:id", requireAuth, requireRole("administrador", "odontologo", "auxiliar"), param("id").isInt().toInt(), handleValidation, getExpedienteById);

// Crear expediente
router.post(
  "/",
  requireAuth,
  requireRole("administrador", "odontologo", "auxiliar"),
  body("id_paciente").isInt().withMessage("id_paciente requerido"),
  body("id_usuario").optional().isInt(),
  body("fechaVisita").optional().isISO8601(),
  handleValidation,
  createExpediente
);

// Actualizar expediente
router.put("/:id", requireAuth, requireRole("administrador", "odontologo"), param("id").isInt().toInt(), body("observaciones").optional().isString(), handleValidation, updateExpediente);

// Eliminar expediente (solo admin)
router.delete("/:id", requireAuth, requireRole("administrador"), param("id").isInt().toInt(), handleValidation, deleteExpediente);

// Historia clinica
router.post("/:id/historia", requireAuth, requireRole("administrador", "odontologo", "auxiliar"), param("id").isInt().toInt(), body("antecedentesFam").optional().isString(), handleValidation, upsertHistoriaClinica);

// Consultas
router.post("/:id/consultas", requireAuth, requireRole("administrador", "odontologo"), param("id").isInt().toInt(), body("diagnostico").optional().isString(), handleValidation, createConsulta);
router.get("/:id/consultas", requireAuth, requireRole("administrador", "odontologo", "auxiliar"), param("id").isInt().toInt(), handleValidation, getConsultasByExpediente);

// ------------------------------------------------------------------

// GET odontograma
router.get("/:id/odontograma", requireAuth, requireRole("administrador", "odontologo", "auxiliar"), param("id").isInt().toInt(), handleValidation, getOdontograma);

// PUT odontograma
router.put("/:id/odontograma", requireAuth, requireRole("administrador", "odontologo", "auxiliar"), param("id").isInt().toInt(), handleValidation, updateOdontograma);

export default router;
