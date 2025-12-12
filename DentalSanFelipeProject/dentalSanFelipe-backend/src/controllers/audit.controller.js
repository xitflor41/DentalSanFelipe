// src/controllers/audit.controller.js
import { pool } from "../config/db.config.js";

/**
 * GET /api/audit/expediente/:id
 * Obtener historial de auditoría de un expediente específico
 */
export const getAuditByExpediente = async (req, res, next) => {
  try {
    const id_expediente = parseInt(req.params.id);
    if (!id_expediente) return res.status(400).json({ message: "ID de expediente inválido" });

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 50);
    const offset = (page - 1) * limit;

    // Contar total de registros
    const [countRows] = await pool.query(
      "SELECT COUNT(*) as total FROM audit_expedientes WHERE id_expediente = ?",
      [id_expediente]
    );
    const total = countRows[0].total;

    // Obtener registros con información del usuario
    const [rows] = await pool.query(
      `SELECT 
        a.id_audit,
        a.id_expediente,
        a.id_usuario,
        a.accion,
        a.detalle,
        a.fecha,
        u.nombre as usuario_nombre,
        u.apellido as usuario_apellido,
        u.rol as usuario_rol
      FROM audit_expedientes a
      LEFT JOIN usuarios u ON a.id_usuario = u.id_usuario
      WHERE a.id_expediente = ?
      ORDER BY a.fecha DESC
      LIMIT ? OFFSET ?`,
      [id_expediente, limit, offset]
    );

    res.json({
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
      data: rows
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/audit/recent
 * Obtener los logs de auditoría más recientes (todos los expedientes)
 */
export const getRecentAudit = async (req, res, next) => {
  try {
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const accion = req.query.accion; // Filtro opcional por tipo de acción
    const id_usuario = req.query.id_usuario; // Filtro opcional por usuario

    let sql = `
      SELECT 
        a.id_audit,
        a.id_expediente,
        a.id_usuario,
        a.accion,
        a.detalle,
        a.fecha,
        u.nombre as usuario_nombre,
        u.apellido as usuario_apellido,
        u.rol as usuario_rol,
        e.numero_expediente,
        p.nombre as paciente_nombre,
        p.apellido as paciente_apellido
      FROM audit_expedientes a
      LEFT JOIN usuarios u ON a.id_usuario = u.id_usuario
      LEFT JOIN expedientes e ON a.id_expediente = e.id_expediente
      LEFT JOIN historia_clinica hc ON e.id_historiaClinica = hc.id_historiaClinica
      LEFT JOIN pacientes p ON hc.id_paciente = p.id_paciente
      WHERE 1=1
    `;

    const params = [];

    if (accion) {
      sql += " AND a.accion = ?";
      params.push(accion);
    }

    if (id_usuario) {
      sql += " AND a.id_usuario = ?";
      params.push(parseInt(id_usuario));
    }

    sql += " ORDER BY a.fecha DESC LIMIT ?";
    params.push(limit);

    const [rows] = await pool.query(sql, params);

    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/audit/stats
 * Obtener estadísticas de auditoría
 */
export const getAuditStats = async (req, res, next) => {
  try {
    const dias = parseInt(req.query.dias) || 30;

    // Conteo por acción
    const [accionStats] = await pool.query(
      `SELECT 
        accion, 
        COUNT(*) as total 
      FROM audit_expedientes 
      WHERE fecha >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY accion 
      ORDER BY total DESC`,
      [dias]
    );

    // Actividad por usuario
    const [usuarioStats] = await pool.query(
      `SELECT 
        u.id_usuario,
        u.nombre,
        u.apellido,
        u.rol,
        COUNT(*) as total_acciones
      FROM audit_expedientes a
      JOIN usuarios u ON a.id_usuario = u.id_usuario
      WHERE a.fecha >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY u.id_usuario
      ORDER BY total_acciones DESC
      LIMIT 10`,
      [dias]
    );

    // Total de registros en el período
    const [totalRows] = await pool.query(
      "SELECT COUNT(*) as total FROM audit_expedientes WHERE fecha >= DATE_SUB(NOW(), INTERVAL ? DAY)",
      [dias]
    );

    res.json({
      periodo_dias: dias,
      total_registros: totalRows[0].total,
      por_accion: accionStats,
      por_usuario: usuarioStats
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/audit/log
 * Crear un log de auditoría manual (para acciones especiales)
 */
export const createAuditLog = async (req, res, next) => {
  try {
    const { id_expediente, accion, detalle } = req.body;
    
    if (!accion) {
      return res.status(400).json({ message: "La acción es requerida" });
    }

    const [result] = await pool.query(
      "INSERT INTO audit_expedientes (id_expediente, id_usuario, accion, detalle) VALUES (?, ?, ?, ?)",
      [
        id_expediente || null,
        req.user?.id_usuario || null,
        accion,
        detalle ? JSON.stringify(detalle) : null
      ]
    );

    res.status(201).json({
      message: "Log de auditoría creado",
      id_audit: result.insertId
    });
  } catch (err) {
    next(err);
  }
};
