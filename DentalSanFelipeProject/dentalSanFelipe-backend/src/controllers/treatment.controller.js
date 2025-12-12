// src/controllers/treatment.controller.js
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
 * GET /api/tratamientos
 * Query params: page, limit, q, id_consulta
 */
export const getTreatments = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;
    const q = (req.query.q || "").trim();
    const id_consulta = req.query.id_consulta ? parseInt(req.query.id_consulta) : null;

    let baseSql = `
      SELECT 
        t.*,
        p.nombre as procedimiento_nombre,
        p.descripcion as procedimiento_descripcion,
        c.diagnostico as consulta_diagnostico,
        e.id_paciente,
        pac.nombre as paciente_nombre,
        pac.apellido as paciente_apellido
      FROM tratamiento t
      LEFT JOIN procedimiento p ON t.id_procedimiento = p.id_procedimiento
      LEFT JOIN consulta c ON t.id_consulta = c.id_consulta
      LEFT JOIN expedientes e ON c.id_expediente = e.id_expediente
      LEFT JOIN pacientes pac ON e.id_paciente = pac.id_paciente
      WHERE 1=1
    `;
    const params = [];

    if (id_consulta) {
      baseSql += " AND t.id_consulta = ?";
      params.push(id_consulta);
    }

    if (q) {
      baseSql += " AND (t.medicamento LIKE ? OR p.nombre LIKE ? OR pac.nombre LIKE ? OR pac.apellido LIKE ?)";
      const like = `%${q}%`;
      params.push(like, like, like, like);
    }

    const countSql = `SELECT COUNT(*) AS total FROM (${baseSql}) AS sub`;
    const [countRows] = await pool.query(countSql, params);
    const total = countRows[0].total;

    const sql = `${baseSql} ORDER BY t.created_at DESC LIMIT ? OFFSET ?`;
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
 * GET /api/tratamientos/:id
 */
export const getTreatmentById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (!id) return res.status(400).json({ message: "Id inválido" });

    const [rows] = await pool.query(
      `SELECT 
        t.*,
        p.nombre as procedimiento_nombre,
        p.descripcion as procedimiento_descripcion,
        c.diagnostico as consulta_diagnostico,
        e.id_paciente,
        pac.nombre as paciente_nombre,
        pac.apellido as paciente_apellido
      FROM tratamiento t
      LEFT JOIN procedimiento p ON t.id_procedimiento = p.id_procedimiento
      LEFT JOIN consulta c ON t.id_consulta = c.id_consulta
      LEFT JOIN expedientes e ON c.id_expediente = e.id_expediente
      LEFT JOIN pacientes pac ON e.id_paciente = pac.id_paciente
      WHERE t.id_tratamiento = ?`,
      [id]
    );

    if (rows.length === 0) return res.status(404).json({ message: "Tratamiento no encontrado" });

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/tratamientos
 */
export const createTreatment = async (req, res, next) => {
  try {
    const { id_procedimiento, id_consulta, medicamento, dosis, viaAdministracion, duracion, efectosAdversos, costo } = req.body;

    const [r] = await pool.query(
      `INSERT INTO tratamiento 
        (id_procedimiento, id_consulta, medicamento, dosis, viaAdministracion, duracion, efectosAdversos, costo) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id_procedimiento || null, id_consulta || null, medicamento || null, dosis || null, 
       viaAdministracion || null, duracion || null, efectosAdversos || null, costo || null]
    );

    // Obtener id_expediente de la consulta para auditoría
    if (id_consulta) {
      const [consulta] = await pool.query("SELECT id_expediente FROM consulta WHERE id_consulta = ?", [id_consulta]);
      const id_expediente = consulta[0]?.id_expediente;
      await insertAudit(id_expediente, req.user?.id_usuario, "CREAR_TRATAMIENTO", { 
        id_tratamiento: r.insertId, 
        id_consulta, 
        medicamento 
      });
    }

    res.status(201).json({
      message: "Tratamiento creado",
      id_tratamiento: r.insertId,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/tratamientos/:id
 */
export const updateTreatment = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (!id) return res.status(400).json({ message: "Id inválido" });

    const { id_procedimiento, id_consulta, medicamento, dosis, viaAdministracion, duracion, efectosAdversos, costo } = req.body;

    const [r] = await pool.query(
      `UPDATE tratamiento SET 
        id_procedimiento = ?, 
        id_consulta = ?,
        medicamento = ?, 
        dosis = ?, 
        viaAdministracion = ?, 
        duracion = ?, 
        efectosAdversos = ?,
        costo = ?
      WHERE id_tratamiento = ?`,
      [id_procedimiento || null, id_consulta || null, medicamento || null, dosis || null, 
       viaAdministracion || null, duracion || null, efectosAdversos || null, costo || null, id]
    );

    if (r.affectedRows === 0) {
      return res.status(404).json({ message: "Tratamiento no encontrado" });
    }

    res.json({ message: "Tratamiento actualizado", id_tratamiento: id });
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
