// src/routes/appointments.routes.js
import { Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import {
  listAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment
} from '../controllers/appointments.controller.js';

import { requireAuth, requireRole } from '../middlewares/auth.middleware.js';

const router = Router();

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

// GET /api/appointments
router.get(
  '/',
  requireAuth,
  requireRole('administrador', 'odontologo', 'auxiliar'),
  query('date').optional().isISO8601().toDate(),
  query('id_usuario').optional().isInt().toInt(),
  handleValidation,
  listAppointments
);

// GET /api/appointments/:id
router.get(
  '/:id',
  requireAuth,
  requireRole('administrador', 'odontologo', 'auxiliar'),
  param('id').isInt().toInt(),
  handleValidation,
  getAppointmentById
);

// POST /api/appointments
router.post(
  '/',
  requireAuth,
  requireRole('administrador', 'odontologo', 'auxiliar'),
  body('id_paciente').isInt().withMessage('id_paciente requerido'),
  body('id_usuario').isInt().withMessage('id_usuario (odontólogo) requerido'),
  body('fecha_cita').isISO8601().withMessage('fecha_cita debe ser ISO8601 datetime (YYYY-MM-DDTHH:mm:ss)'),
  body('duracion_min').optional().isInt({ min: 5, max: 480 }).toInt(),
  body('motivo').optional().isString().trim(),
  handleValidation,
  createAppointment
);

// PUT /api/appointments/:id
router.put(
  '/:id',
  requireAuth,
  requireRole('administrador', 'odontologo', 'auxiliar'),
  param('id').isInt().toInt(),
  body('id_paciente').optional().isInt(),
  body('id_usuario').optional().isInt(),
  body('fecha_cita').optional().isISO8601(),
  body('duracion_min').optional().isInt({ min: 5, max: 480 }).toInt(),
  body('motivo').optional().isString().trim(),
  handleValidation,
  updateAppointment
);

// DELETE /api/appointments/:id
router.delete(
  '/:id',
  requireAuth,
  requireRole('administrador'),
  param('id').isInt().toInt(),
  handleValidation,
  deleteAppointment
);

export default router;
