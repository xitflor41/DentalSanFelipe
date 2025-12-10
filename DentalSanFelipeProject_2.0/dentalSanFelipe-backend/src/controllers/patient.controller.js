// src/controllers/patient.controller.js
import { pool } from "../config/db.config.js";

/**
 * GET /api/patients
 * Query params: page, limit, q (search by nombre|apellido|telefono)
 */
export const getPatients = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;
    const q = (req.query.q || "").trim();

    let baseSql = "SELECT id_paciente, nombre, apellido, telefono, sexo, fecha_nac, created_at FROM pacientes";
    const params = [];

    if (q) {
      baseSql += " WHERE nombre LIKE ? OR apellido LIKE ? OR telefono LIKE ?";
      const like = `%${q}%`;
      params.push(like, like, like);
    }

    const countSql = `SELECT COUNT(*) AS total FROM (${baseSql}) AS sub`;
    const [countRows] = await pool.query(countSql, params);
    const total = countRows[0].total;

    const sql = `${baseSql} ORDER BY id_paciente DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);
    const [rows] = await pool.query(sql, params);

    res.json({
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
      data: rows,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/patients/:id
 */
export const getPatientById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (!id) return res.status(400).json({ message: "Id inválido" });

    const [rows] = await pool.query(
      "SELECT id_paciente, nombre, apellido, telefono, sexo, fecha_nac, created_at, updated_at FROM pacientes WHERE id_paciente = ?",
      [id]
    );

    if (!rows.length) return res.status(404).json({ message: "Paciente no encontrado" });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/patients
 * Body: nombre, apellido, telefono, sexo, fecha_nac
 */
export const createPatient = async (req, res, next) => {
  try {
    const { nombre, apellido, telefono, sexo, fecha_nac } = req.body;

    const [result] = await pool.query(
      "INSERT INTO pacientes (nombre, apellido, telefono, sexo, fecha_nac) VALUES (?, ?, ?, ?, ?)",
      [nombre, apellido || null, telefono || null, sexo || null, fecha_nac || null]
    );

    const [rows] = await pool.query("SELECT id_paciente, nombre, apellido, telefono, sexo, fecha_nac FROM pacientes WHERE id_paciente = ?", [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/patients/:id
 * Body: nombre, apellido, telefono, sexo, fecha_nac
 */
export const updatePatient = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (!id) return res.status(400).json({ message: "Id inválido" });

    const { nombre, apellido, telefono, sexo, fecha_nac } = req.body;

    const [result] = await pool.query(
      `UPDATE pacientes SET nombre = ?, apellido = ?, telefono = ?, sexo = ?, fecha_nac = ?, updated_at = CURRENT_TIMESTAMP WHERE id_paciente = ?`,
      [nombre, apellido || null, telefono || null, sexo || null, fecha_nac || null, id]
    );

    if (result.affectedRows === 0) return res.status(404).json({ message: "Paciente no encontrado" });

    const [rows] = await pool.query("SELECT id_paciente, nombre, apellido, telefono, sexo, fecha_nac, updated_at FROM pacientes WHERE id_paciente = ?", [id]);
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/patients/:id
 * Only admin can delete patients (safety)
 */
export const deletePatient = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (!id) return res.status(400).json({ message: "Id inválido" });

    const [result] = await pool.query("DELETE FROM pacientes WHERE id_paciente = ?", [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Paciente no encontrado" });

    res.json({ message: "Paciente eliminado correctamente", id_paciente: id });
  } catch (err) {
    next(err);
  }
};
