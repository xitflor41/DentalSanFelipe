// src/controllers/attachment.controller.js
import path from "path";
import fs from "fs";
import { pool } from "../config/db.config.js";

/** Helper audit (si ya la tienes, úsala; aquí la duplico por seguridad) */
const insertAudit = async (id_expediente, id_usuario, accion, detalle = "") => {
  try {
    await pool.query(
      "INSERT INTO audit_expedientes (id_expediente, id_usuario, accion, detalle) VALUES (?, ?, ?, ?)",
      [id_expediente || null, id_usuario || null, accion, typeof detalle === "string" ? detalle : JSON.stringify(detalle)]
    );
  } catch (err) {
    console.error("Error insertando audit_expedientes:", err.message);
  }
};

const UPLOAD_DIR = path.join(process.cwd(), "uploads", "adjuntos");

export const uploadAdjunto = async (req, res, next) => {
  try {
    // multer ya puso file en req.file
    if (!req.file) return res.status(400).json({ message: "Archivo requerido (campo 'file')" });

    const { id_expediente, nombre } = req.body;
    if (!id_expediente) return res.status(400).json({ message: "id_expediente es requerido" });
    // verificar expediente existe (opcional)
    const [exp] = await pool.query("SELECT id_expediente FROM expedientes WHERE id_expediente = ?", [id_expediente]);
    if (!exp.length) {
      // borrar archivo guardado si expediente inexistente
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: "Expediente no encontrado" });
    }

    const rutaRel = path.join("uploads", "adjuntos", req.file.filename).replace(/\\/g, "/");
    const [r] = await pool.query(
      "INSERT INTO adjuntos (id_expediente, nombreArchivo, rutaArchivo, tipoArchivo) VALUES (?, ?, ?, ?)",
      [id_expediente, nombre || req.file.originalname, rutaRel, req.file.mimetype]
    );

    // auditoría
    await insertAudit(id_expediente, req.user?.id_usuario, "SUBIR_ADJUNTO", { id_adjunto: r.insertId, nombreArchivo: req.file.originalname });

    const [rows] = await pool.query("SELECT * FROM adjuntos WHERE id_adjunto = ?", [r.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

export const listAdjuntosByExpediente = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (!id) return res.status(400).json({ message: "Id inválido" });
    const [rows] = await pool.query("SELECT id_adjunto, id_expediente, nombreArchivo, rutaArchivo, tipoArchivo, uploaded_at FROM adjuntos WHERE id_expediente = ? ORDER BY uploaded_at DESC", [id]);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

export const downloadAdjunto = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (!id) return res.status(400).json({ message: "Id inválido" });
    const [rows] = await pool.query("SELECT * FROM adjuntos WHERE id_adjunto = ?", [id]);
    if (!rows.length) return res.status(404).json({ message: "Adjunto no encontrado" });
    const a = rows[0];
    const filePath = path.join(process.cwd(), a.rutaArchivo);
    // por seguridad, verifica que la ruta esté dentro de uploads
    if (!filePath.startsWith(UPLOAD_DIR)) {
      return res.status(400).json({ message: "Ruta de archivo inválida" });
    }
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: "Archivo no encontrado en disco" });
    res.download(filePath, a.nombreArchivo);
  } catch (err) {
    next(err);
  }
};

export const deleteAdjunto = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (!id) return res.status(400).json({ message: "Id inválido" });
    const [rows] = await pool.query("SELECT * FROM adjuntos WHERE id_adjunto = ?", [id]);
    if (!rows.length) return res.status(404).json({ message: "Adjunto no encontrado" });
    const a = rows[0];
    const filePath = path.join(process.cwd(), a.rutaArchivo);
    // borrar registro DB
    const [r] = await pool.query("DELETE FROM adjuntos WHERE id_adjunto = ?", [id]);
    // borrar fichero si existe
    if (fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch (e) { console.warn("No se pudo borrar archivo del disco:", e.message); }
    }
    // audit
    await insertAudit(a.id_expediente, req.user?.id_usuario, "ELIMINAR_ADJUNTO", { id_adjunto: id, nombreArchivo: a.nombreArchivo });
    res.json({ message: "Adjunto eliminado", id_adjunto: id });
  } catch (err) {
    next(err);
  }
};
