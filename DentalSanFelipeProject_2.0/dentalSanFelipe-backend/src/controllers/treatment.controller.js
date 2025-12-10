// src/controllers/treatment.controller.js
import { pool } from "../config/db.config.js";

export const getTreatments = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`SELECT t.*, p.nombreProcedimiento FROM tratamiento t LEFT JOIN procedimiento p ON t.id_procedimiento = p.id_procedimiento ORDER BY t.id_tratamiento DESC`);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

export const getTreatmentById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const [rows] = await pool.query("SELECT * FROM tratamiento WHERE id_tratamiento = ?", [id]);
    if (!rows.length) return res.status(404).json({ message: "No encontrado" });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

export const createTreatment = async (req, res, next) => {
  try {
    const { id_procedimiento, medicamento, dosis, viaAdministracion, duracion, efectosAdversos } = req.body;
    const [r] = await pool.query("INSERT INTO tratamiento (id_procedimiento, medicamento, dosis, viaAdministracion, duracion, efectosAdversos) VALUES (?, ?, ?, ?, ?, ?)",
      [id_procedimiento || null, medicamento || null, dosis || null, viaAdministracion || null, duracion || null, efectosAdversos || null]);
    const [rows] = await pool.query("SELECT * FROM tratamiento WHERE id_tratamiento = ?", [r.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

export const updateTreatment = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { id_procedimiento, medicamento, dosis, viaAdministracion, duracion, efectosAdversos } = req.body;
    const [r] = await pool.query(`UPDATE tratamiento SET id_procedimiento = ?, medicamento = ?, dosis = ?, viaAdministracion = ?, duracion = ?, efectosAdversos = ? WHERE id_tratamiento = ?`,
      [id_procedimiento || null, medicamento || null, dosis || null, viaAdministracion || null, duracion || null, efectosAdversos || null, id]);
    if (r.affectedRows === 0) return res.status(404).json({ message: "No encontrado" });
    const [rows] = await pool.query("SELECT * FROM tratamiento WHERE id_tratamiento = ?", [id]);
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

export const deleteTreatment = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const [r] = await pool.query("DELETE FROM tratamiento WHERE id_tratamiento = ?", [id]);
    if (r.affectedRows === 0) return res.status(404).json({ message: "No encontrado" });
    res.json({ message: "Tratamiento eliminado", id_tratamiento: id });
  } catch (err) {
    next(err);
  }
};
