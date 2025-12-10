// src/controllers/procedure.controller.js
import { pool } from "../config/db.config.js";

export const getProcedimientos = async (req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT * FROM procedimiento ORDER BY nombreProcedimiento ASC");
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

export const getProcedimientoById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (!id) return res.status(400).json({ message: "Id inválido" });
    const [rows] = await pool.query("SELECT * FROM procedimiento WHERE id_procedimiento = ?", [id]);
    if (!rows.length) return res.status(404).json({ message: "No encontrado" });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

export const createProcedimiento = async (req, res, next) => {
  try {
    const { nombreProcedimiento, descripcion, costo } = req.body;
    const [r] = await pool.query("INSERT INTO procedimiento (nombreProcedimiento, descripcion, costo) VALUES (?, ?, ?)", [nombreProcedimiento, descripcion || null, costo || 0]);
    const [rows] = await pool.query("SELECT * FROM procedimiento WHERE id_procedimiento = ?", [r.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

export const updateProcedimiento = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { nombreProcedimiento, descripcion, costo } = req.body;
    const [r] = await pool.query("UPDATE procedimiento SET nombreProcedimiento = ?, descripcion = ?, costo = ? WHERE id_procedimiento = ?", [nombreProcedimiento, descripcion || null, costo || 0, id]);
    if (r.affectedRows === 0) return res.status(404).json({ message: "No encontrado" });
    const [rows] = await pool.query("SELECT * FROM procedimiento WHERE id_procedimiento = ?", [id]);
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

export const deleteProcedimiento = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const [r] = await pool.query("DELETE FROM procedimiento WHERE id_procedimiento = ?", [id]);
    if (r.affectedRows === 0) return res.status(404).json({ message: "No encontrado" });
    res.json({ message: "Procedimiento eliminado", id_procedimiento: id });
  } catch (err) {
    next(err);
  }
};
