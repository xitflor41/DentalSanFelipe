// src/middlewares/upload.middleware.js
import multer from "multer";
import path from "path";
import fs from "fs";

const UPLOAD_BASE = path.join(process.cwd(), "uploads", "adjuntos");

// Aseguramos que la carpeta exista
fs.mkdirSync(UPLOAD_BASE, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_BASE);
  },
  filename: function (req, file, cb) {
    // timestamp + sanitized original name
    const safeName = file.originalname.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_\.-]/g, "");
    cb(null, `${Date.now()}_${safeName}`);
  },
});

const fileFilter = (req, file, cb) => {
  // permitir imágenes y PDFs; ajusta según lo que necesites
  const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Tipo de archivo no permitido. Solo JPG/PNG/WEBP/PDF."));
};

export const uploadSingle = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter,
}).single("file");
