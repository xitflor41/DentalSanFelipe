// src/controllers/procedure.controller.js
import { pool } from "../config/db.config.js";

/**
 * GET /api/procedimientos
 * Query params: page, limit, q, categoria, activo
 */
export const getProcedimientos = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;
    const q = (req.query.q || "").trim();
    const categoria = req.query.categoria;
    const activo = req.query.activo;

    let baseSql = "SELECT * FROM procedimiento WHERE 1=1";
    const params = [];

    if (q) {
      baseSql += " AND (nombre LIKE ? OR descripcion LIKE ?)";
      const like = `%${q}%`;
      params.push(like, like);
    }

    if (categoria) {
      baseSql += " AND categoria = ?";
      params.push(categoria);
    }

    if (activo !== undefined) {
      baseSql += " AND activo = ?";
      params.push(activo === 'true' || activo === true ? 1 : 0);
    }

    const countSql = `SELECT COUNT(*) AS total FROM (${baseSql}) AS sub`;
    const [countRows] = await pool.query(countSql, params);
    const total = countRows[0].total;

    const sql = `${baseSql} ORDER BY nombre ASC LIMIT ? OFFSET ?`;
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
 * GET /api/procedimientos/:id
 */
export const getProcedimientoById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (!id) return res.status(400).json({ message: "Id inválido" });

    const [rows] = await pool.query("SELECT * FROM procedimiento WHERE id_procedimiento = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ message: "Procedimiento no encontrado" });

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/procedimientos
 */
export const createProcedimiento = async (req, res, next) => {
  try {
    const { nombre, descripcion, costo_base, duracion_estimada, categoria, activo } = req.body;

    if (!nombre) {
      return res.status(400).json({ message: "El nombre es requerido" });
    }

    const [r] = await pool.query(
      `INSERT INTO procedimiento (nombre, descripcion, costo_base, duracion_estimada, categoria, activo) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nombre, descripcion || null, costo_base || null, duracion_estimada || null, categoria || null, activo !== false ? 1 : 0]
    );

    res.status(201).json({
      message: "Procedimiento creado",
      id_procedimiento: r.insertId,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/procedimientos/:id
 */
export const updateProcedimiento = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (!id) return res.status(400).json({ message: "Id inválido" });

    const { nombre, descripcion, costo_base, duracion_estimada, categoria, activo } = req.body;

    const [r] = await pool.query(
      `UPDATE procedimiento SET 
        nombre = ?, 
        descripcion = ?, 
        costo_base = ?, 
        duracion_estimada = ?, 
        categoria = ?, 
        activo = ?
      WHERE id_procedimiento = ?`,
      [nombre, descripcion || null, costo_base || null, duracion_estimada || null, categoria || null, activo !== false ? 1 : 0, id]
    );

    if (r.affectedRows === 0) {
      return res.status(404).json({ message: "Procedimiento no encontrado" });
    }

    res.json({ message: "Procedimiento actualizado", id_procedimiento: id });
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
