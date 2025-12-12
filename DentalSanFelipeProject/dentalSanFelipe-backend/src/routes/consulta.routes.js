// src/routes/consulta.routes.js
import { Router } from "express";
import { body, param, query, validationResult } from "express-validator";
import {
  getConsultas,
  getConsultaById,
  createConsulta,
  updateConsulta,
  deleteConsulta,
} from "../controllers/consulta.controller.js";

import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";

const router = Router();

/* Helper validation middleware */
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  return next();
};

// GET /api/consultas
router.get(
  "/",
  requireAuth,
  requireRole("administrador", "odontologo", "auxiliar"),
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1 }).toInt(),
  query("q").optional().isString().trim(),
  query("id_expediente").optional().isInt().toInt(),
  handleValidation,
  getConsultas
);

// GET /api/consultas/:id
router.get(
  "/:id",
  requireAuth,
  requireRole("administrador", "odontologo", "auxiliar"),
  param("id").isInt().toInt(),
  handleValidation,
  getConsultaById
);

// POST /api/consultas
router.post(
  "/",
  requireAuth,
  requireRole("administrador", "odontologo"),
  body("id_expediente").isInt().toInt(),
  body("exploracionFisica").optional({ checkFalsy: true }).isString(),
  body("diagnostico").optional({ checkFalsy: true }).isString(),
  body("notas").optional({ checkFalsy: true }).isString(),
  body("realizado_por").optional({ checkFalsy: true }).isInt().toInt(),
  handleValidation,
  createConsulta
);

// PUT /api/consultas/:id
router.put(
  "/:id",
  requireAuth,
  requireRole("administrador", "odontologo"),
  param("id").isInt().toInt(),
  body("id_expediente").isInt().toInt(),
  body("exploracionFisica").optional({ checkFalsy: true }).isString(),
  body("diagnostico").optional({ checkFalsy: true }).isString(),
  body("notas").optional({ checkFalsy: true }).isString(),
  body("realizado_por").optional({ checkFalsy: true }).isInt().toInt(),
  handleValidation,
  updateConsulta
);

// DELETE /api/consultas/:id
router.delete(
  "/:id",
  requireAuth,
  requireRole("administrador", "odontologo"),
  param("id").isInt().toInt(),
  handleValidation,
  deleteConsulta
);

export default router;
