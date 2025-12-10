// src/routes/procedure.routes.js
import { Router } from "express";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";
import { body, param, validationResult } from "express-validator";
import {
  getProcedimientos,
  getProcedimientoById,
  createProcedimiento,
  updateProcedimiento,
  deleteProcedimiento,
} from "../controllers/procedure.controller.js";

const router = Router();
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  return next();
};

router.get("/", requireAuth, requireRole("administrador", "odontologo", "auxiliar"), getProcedimientos);
router.get("/:id", requireAuth, requireRole("administrador", "odontologo", "auxiliar"), param("id").isInt().toInt(), handleValidation, getProcedimientoById);
router.post("/", requireAuth, requireRole("administrador"), body("nombreProcedimiento").isString().notEmpty(), handleValidation, createProcedimiento);
router.put("/:id", requireAuth, requireRole("administrador"), param("id").isInt().toInt(), body("nombreProcedimiento").isString().notEmpty(), handleValidation, updateProcedimiento);
router.delete("/:id", requireAuth, requireRole("administrador"), param("id").isInt().toInt(), handleValidation, deleteProcedimiento);

export default router;
