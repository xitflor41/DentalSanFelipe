// src/controllers/consulta.controller.js
import { pool } from "../config/db.config.js";

/** Helper: insertar en audit_expedientes */
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

/**
 * GET /api/consultas
 * Query params: page, limit, q, id_expediente
 */
export const getConsultas = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;
    const q = (req.query.q || "").trim();
    const id_expediente = req.query.id_expediente ? parseInt(req.query.id_expediente) : null;
    
    // Obtener rol e id del usuario actual
    const userRole = req.user?.rol;
    const userId = req.user?.id_usuario;

    let baseSql = `
      SELECT 
        c.*,
        e.numero_expediente as expediente_numero,
        p.nombre as paciente_nombre,
        p.apellido as paciente_apellido,
        u.nombre as realizado_por_nombre,
        u.apellido as realizado_por_apellido
      FROM consulta c
      LEFT JOIN expedientes e ON c.id_expediente = e.id_expediente
      LEFT JOIN pacientes p ON e.id_paciente = p.id_paciente
      LEFT JOIN usuarios u ON c.realizado_por = u.id_usuario
      WHERE 1=1
    `;
    const params = [];

    // Si es odontólogo, solo ver consultas de expedientes asignados a él o realizadas por él
    // Los administradores y auxiliares ven todas las consultas
    if (userRole === 'odontologo') {
      baseSql += " AND (e.id_usuario = ? OR c.realizado_por = ?)";
      params.push(userId, userId);
    }

    if (id_expediente) {
      baseSql += " AND c.id_expediente = ?";
      params.push(id_expediente);
    }

    if (q) {
      baseSql += " AND (c.diagnostico LIKE ? OR c.notas LIKE ? OR p.nombre LIKE ? OR p.apellido LIKE ?)";
      const like = `%${q}%`;
      params.push(like, like, like, like);
    }

    const countSql = `SELECT COUNT(*) AS total FROM (${baseSql}) AS sub`;
    const [countRows] = await pool.query(countSql, params);
    const total = countRows[0].total;

    const sql = `${baseSql} ORDER BY c.created_at DESC LIMIT ? OFFSET ?`;
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
 * GET /api/consultas/:id
 */
export const getConsultaById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (!id) return res.status(400).json({ message: "Id inválido" });

    const [rows] = await pool.query(
      `SELECT 
        c.*,
        e.numero_expediente as expediente_numero,
        p.nombre as paciente_nombre,
        p.apellido as paciente_apellido,
        u.nombre as realizado_por_nombre,
        u.apellido as realizado_por_apellido
      FROM consulta c
      LEFT JOIN expedientes e ON c.id_expediente = e.id_expediente
      LEFT JOIN pacientes p ON e.id_paciente = p.id_paciente
      LEFT JOIN usuarios u ON c.realizado_por = u.id_usuario
      WHERE c.id_consulta = ?`,
      [id]
    );

    if (rows.length === 0) return res.status(404).json({ message: "Consulta no encontrada" });

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/consultas
 */
export const createConsulta = async (req, res, next) => {
  try {
    const { id_expediente, exploracionFisica, diagnostico, notas, realizado_por } = req.body;

    if (!id_expediente) {
      return res.status(400).json({ message: "id_expediente es requerido" });
    }

    const [result] = await pool.query(
      `INSERT INTO consulta (id_expediente, exploracionFisica, diagnostico, notas, realizado_por) 
       VALUES (?, ?, ?, ?, ?)`,
      [id_expediente, exploracionFisica, diagnostico, notas, realizado_por]
    );

    // Auditoría
    await insertAudit(id_expediente, req.user?.id_usuario, "CREAR_CONSULTA", { 
      id_consulta: result.insertId, 
      diagnostico 
    });

    res.status(201).json({
      message: "Consulta creada",
      id_consulta: result.insertId,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/consultas/:id
 */
export const updateConsulta = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (!id) return res.status(400).json({ message: "Id inválido" });

    const { id_expediente, exploracionFisica, diagnostico, notas, realizado_por } = req.body;

    const [result] = await pool.query(
      `UPDATE consulta SET 
        id_expediente = ?, 
        exploracionFisica = ?, 
        diagnostico = ?, 
        notas = ?, 
        realizado_por = ?
      WHERE id_consulta = ?`,
      [id_expediente, exploracionFisica, diagnostico, notas, realizado_por, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Consulta no encontrada" });
    }

    // Auditoría
    await insertAudit(id_expediente, req.user?.id_usuario, "MODIFICAR_CONSULTA", { 
      id_consulta: id, 
      diagnostico 
    });

    res.json({ message: "Consulta actualizada", id_consulta: id });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/consultas/:id
 */
export const deleteConsulta = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (!id) return res.status(400).json({ message: "Id inválido" });

    // Obtener id_expediente antes de eliminar
    const [consulta] = await pool.query("SELECT id_expediente FROM consulta WHERE id_consulta = ? AND deleted_at IS NULL", [id]);
    if (!consulta.length) return res.status(404).json({ message: "Consulta no encontrada" });
    
    const id_expediente = consulta[0]?.id_expediente;

    // Soft delete
    const [result] = await pool.query(
      "UPDATE consulta SET deleted_at = NOW(), deleted_by = ? WHERE id_consulta = ? AND deleted_at IS NULL",
      [req.user?.id_usuario, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Consulta no encontrada" });
    }

    // Auditoría
    await insertAudit(id_expediente, req.user?.id_usuario, "SOFT_DELETE_CONSULTA", { id_consulta: id });

    res.json({ message: "Consulta eliminada", id_consulta: id });
  } catch (err) {
    next(err);
  }
};
