// src/routes/treatment.routes.js
import { Router } from "express";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";
import { body, param, validationResult } from "express-validator";
import {
  getTreatments,
  getTreatmentById,
  createTreatment,
  updateTreatment,
  deleteTreatment,
} from "../controllers/treatment.controller.js";

const router = Router();
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  return next();
};

router.get("/", requireAuth, requireRole("administrador", "odontologo", "auxiliar"), getTreatments);
router.get("/:id", requireAuth, requireRole("administrador", "odontologo", "auxiliar"), param("id").isInt().toInt(), handleValidation, getTreatmentById);
router.post("/", requireAuth, requireRole("administrador", "odontologo"), body("medicamento").optional().isString(), handleValidation, createTreatment);
router.put("/:id", requireAuth, requireRole("administrador", "odontologo"), param("id").isInt().toInt(), handleValidation, updateTreatment);
router.delete("/:id", requireAuth, requireRole("administrador"), param("id").isInt().toInt(), handleValidation, deleteTreatment);

export default router;
