// server.js o app.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./src/routes/auth.routes.js";
import userRoutes from "./src/routes/user.routes.js";
import patientRoutes from "./src/routes/patient.routes.js"; // Si ya existe

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas públicas
app.use("/api/auth", authRoutes);

// Rutas protegidas
app.use("/api/users", userRoutes);
app.use("/api/patients", patientRoutes);

// Agregar más rutas según necesites

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});