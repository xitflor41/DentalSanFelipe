// src/routes/patient.routes.js
import { Router } from "express";
import { body, param, query, validationResult } from "express-validator";
import {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  getHistoriaByPaciente,
  upsertHistoriaByPaciente,
} from "../controllers/patient.controller.js";

import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";

const router = Router();

/* Helper validation middleware */
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  return next();
};

// GET /api/patients
router.get(
  "/",
  requireAuth,
  // allowed roles: admin, odontologo, auxiliar
  requireRole("administrador", "odontologo", "auxiliar"),
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1 }).toInt(),
  query("q").optional().isString().trim().escape(),
  handleValidation,
  getPatients
);

// GET /api/patients/:id
router.get(
  "/:id",
  requireAuth,
  requireRole("administrador", "odontologo", "auxiliar"),
  param("id").isInt().toInt(),
  handleValidation,
  getPatientById
);

// POST /api/patients
router.post(
  "/",
  requireAuth,
  requireRole("administrador", "odontologo", "auxiliar"),
  body("nombre").isString().trim().notEmpty().withMessage("Nombre requerido"),
  body("apellido").optional({ checkFalsy: true }).isString().trim(),
  body("telefono").optional({ checkFalsy: true }).isString().trim(),
  body("sexo").optional({ checkFalsy: true }).isIn(["M", "F", "Otro"]),
  body("fecha_nac").optional({ checkFalsy: true }).isISO8601().toDate(),
  handleValidation,
  createPatient
);

// PUT /api/patients/:id
router.put(
  "/:id",
  requireAuth,
  requireRole("administrador", "odontologo", "auxiliar"),
  param("id").isInt().toInt(),
  body("nombre").isString().trim().notEmpty().withMessage("Nombre requerido"),
  body("apellido").optional({ checkFalsy: true }).isString().trim(),
  body("telefono").optional({ checkFalsy: true }).isString().trim(),
  body("sexo").optional({ checkFalsy: true }).isIn(["M", "F", "Otro"]),
  body("fecha_nac").optional({ checkFalsy: true }).isISO8601().toDate(),
  handleValidation,
  updatePatient
);

// DELETE /api/patients/:id  (restrict to admin)
router.delete(
  "/:id",
  requireAuth,
  requireRole("administrador"),
  param("id").isInt().toInt(),
  handleValidation,
  deletePatient
);

// GET /api/patients/:id/historia
router.get(
  "/:id/historia",
  requireAuth,
  requireRole("administrador", "odontologo", "auxiliar"),
  param("id").isInt().toInt(),
  handleValidation,
  getHistoriaByPaciente
);

// POST /api/patients/:id/historia
router.post(
  "/:id/historia",
  requireAuth,
  requireRole("administrador", "odontologo", "auxiliar"),
  param("id").isInt().toInt(),
  body("antecedentesFam").optional({ checkFalsy: true }).isString(),
  body("antecedentesPrsnls").optional({ checkFalsy: true }).isString(),
  body("padecimientosPrevios").optional({ checkFalsy: true }).isString(),
  body("factorRiesgo").optional({ checkFalsy: true }).isString(),
  body("alergias").optional({ checkFalsy: true }).isString(),
  handleValidation,
  upsertHistoriaByPaciente
);

export default router;
