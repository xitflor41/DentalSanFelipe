// src/routes/attachment.routes.js
import { Router } from "express";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";
import { uploadSingle } from "../middlewares/upload.middleware.js";
import { uploadAdjunto, listAdjuntosByExpediente, downloadAdjunto, deleteAdjunto } from "../controllers/attachment.controller.js";

const router = Router();

// Subir adjunto (multipart/form-data) campo 'file' + id_expediente (form field) + nombre (opcional)
router.post("/", requireAuth, requireRole("administrador", "odontologo", "auxiliar"), (req, res, next) => {
  uploadSingle(req, res, function (err) {
    if (err) {
      // Multer error handling
      return res.status(400).json({ message: err.message });
    }
    return uploadAdjunto(req, res, next);
  });
});

// Listar adjuntos por expediente
router.get("/expediente/:id", requireAuth, requireRole("administrador", "odontologo", "auxiliar"), listAdjuntosByExpediente);

// Descargar adjunto
router.get("/:id/download", requireAuth, requireRole("administrador", "odontologo", "auxiliar"), downloadAdjunto);

// Borrar adjunto (solo admin)
router.delete("/:id", requireAuth, requireRole("administrador"), deleteAdjunto);

export default router;
