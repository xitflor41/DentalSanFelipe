// src/routes/index.routes.js
import { Router } from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import patientRoutes from "./patient.routes.js";
import appointmentRoutes from "./appointment.routes.js";
import recordRoutes from "./record.routes.js";
import notificationRoutes from "./notification.routes.js";
import healthRoutes from "./health.routes.js";
import procedureRoutes from "./procedure.routes.js";   // <-- IMPORT agregado
import treatmentRoutes from "./treatment.routes.js";   // <-- IMPORT agregado
import attachmentRoutes from "./attachment.routes.js";

const router = Router();

// Rutas de módulos
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/patients", patientRoutes);
router.use("/appointments", appointmentRoutes);
router.use("/records", recordRoutes);
router.use("/notifications", notificationRoutes);
router.use("/procedimientos", procedureRoutes); // /api/procedimientos
router.use("/tratamientos", treatmentRoutes); // /api/tratamientos
router.use("/adjuntos", attachmentRoutes); // /api/adjuntos

// Montamos health en la raíz del router para que quede /api/health
router.use("/", healthRoutes);



// Ruta simple de estado
router.get("/status", (req, res) => {
  res.json({ message: "API lista y modularizada ✅" });
});

export default router;
