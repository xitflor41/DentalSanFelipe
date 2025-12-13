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
 * Filtrado por rol:
 * - administrador: ve TODOS los tratamientos
 * - odontologo: solo tratamientos de sus pacientes asignados
 * - auxiliar: solo tratamientos de sus pacientes asignados
 */
export const getTreatments = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;
    const q = (req.query.q || "").trim();
    const id_consulta = req.query.id_consulta ? parseInt(req.query.id_consulta) : null;

    const userRole = req.user?.rol;
    const userId = req.user?.id_usuario;

    let baseSql = `
      SELECT 
        t.*,
        p.nombre as procedimiento_nombre,
        p.descripcion as procedimiento_descripcion,
        c.diagnostico as consulta_diagnostico,
        e.id_paciente,
        e.id_usuario as expediente_odontologo,
        pac.nombre as paciente_nombre,
        pac.apellido as paciente_apellido,
        pac.assigned_doctor_id
      FROM tratamiento t
      LEFT JOIN procedimiento p ON t.id_procedimiento = p.id_procedimiento
      LEFT JOIN consulta c ON t.id_consulta = c.id_consulta
      LEFT JOIN expedientes e ON c.id_expediente = e.id_expediente
      LEFT JOIN pacientes pac ON e.id_paciente = pac.id_paciente
      WHERE 1=1
    `;
    const params = [];

    // Filtrado por rol
    if (userRole === 'odontologo') {
      baseSql += " AND pac.assigned_doctor_id = ?";
      params.push(userId);
    } else if (userRole === 'auxiliar') {
      baseSql += " AND pac.assigned_doctor_id = ?";
      params.push(userId);
    }
    // administrador: no filtrar, ve todo

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
 * Con filtrado por rol
 */
export const getTreatmentById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (!id) return res.status(400).json({ message: "Id inválido" });

    const userRole = req.user?.rol;
    const userId = req.user?.id_usuario;

    let sql = `
      SELECT 
        t.*,
        p.nombre as procedimiento_nombre,
        p.descripcion as procedimiento_descripcion,
        c.diagnostico as consulta_diagnostico,
        e.id_paciente,
        e.id_usuario as expediente_odontologo,
        pac.nombre as paciente_nombre,
        pac.apellido as paciente_apellido,
        pac.assigned_doctor_id
      FROM tratamiento t
      LEFT JOIN procedimiento p ON t.id_procedimiento = p.id_procedimiento
      LEFT JOIN consulta c ON t.id_consulta = c.id_consulta
      LEFT JOIN expedientes e ON c.id_expediente = e.id_expediente
      LEFT JOIN pacientes pac ON e.id_paciente = pac.id_paciente
      WHERE t.id_tratamiento = ?
    `;
    const params = [id];

    // Filtrado por rol
    if (userRole === 'odontologo' || userRole === 'auxiliar') {
      sql += " AND pac.assigned_doctor_id = ?";
      params.push(userId);
    }

    const [rows] = await pool.query(sql, params);

    if (rows.length === 0) return res.status(404).json({ message: "Tratamiento no encontrado o sin acceso" });

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/tratamientos
 * Con validación de permisos
 */
export const createTreatment = async (req, res, next) => {
  try {
    const { id_procedimiento, id_consulta, medicamento, dosis, viaAdministracion, duracion, efectosAdversos, costo } = req.body;
    const userRole = req.user?.rol;
    const userId = req.user?.id_usuario;

    // Validar que la consulta existe y verificar permisos
    if (id_consulta) {
      const [consulta] = await pool.query(
        `SELECT c.id_expediente, e.id_paciente, p.assigned_doctor_id 
         FROM consulta c
         LEFT JOIN expedientes e ON c.id_expediente = e.id_expediente
         LEFT JOIN pacientes p ON e.id_paciente = p.id_paciente
         WHERE c.id_consulta = ?`,
        [id_consulta]
      );

      if (!consulta.length) {
        return res.status(404).json({ message: "Consulta no encontrada" });
      }

      // Verificar permisos: odontólogos y auxiliares solo pueden crear tratamientos para sus pacientes
      if (userRole === 'odontologo' || userRole === 'auxiliar') {
        if (consulta[0].assigned_doctor_id !== userId) {
          return res.status(403).json({ message: "No tienes permiso para crear tratamientos para este paciente" });
        }
      }
    }

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
 * Con validación de permisos
 */
export const updateTreatment = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (!id) return res.status(400).json({ message: "Id inválido" });

    const { id_procedimiento, id_consulta, medicamento, dosis, viaAdministracion, duracion, efectosAdversos, costo } = req.body;
    const userRole = req.user?.rol;
    const userId = req.user?.id_usuario;

    // Verificar permisos antes de actualizar
    const [tratamiento] = await pool.query(
      `SELECT t.id_tratamiento, c.id_expediente, e.id_paciente, p.assigned_doctor_id
       FROM tratamiento t
       LEFT JOIN consulta c ON t.id_consulta = c.id_consulta
       LEFT JOIN expedientes e ON c.id_expediente = e.id_expediente
       LEFT JOIN pacientes p ON e.id_paciente = p.id_paciente
       WHERE t.id_tratamiento = ?`,
      [id]
    );

    if (!tratamiento.length) {
      return res.status(404).json({ message: "Tratamiento no encontrado" });
    }

    // Verificar permisos: odontólogos y auxiliares solo pueden actualizar tratamientos de sus pacientes
    if (userRole === 'odontologo' || userRole === 'auxiliar') {
      if (tratamiento[0].assigned_doctor_id !== userId) {
        return res.status(403).json({ message: "No tienes permiso para actualizar este tratamiento" });
      }
    }

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

/**
 * DELETE /api/tratamientos/:id
 * Solo administradores y odontólogos del paciente pueden eliminar
 */
export const deleteTreatment = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const userRole = req.user?.rol;
    const userId = req.user?.id_usuario;

    // Verificar permisos antes de eliminar
    const [tratamiento] = await pool.query(
      `SELECT t.id_tratamiento, c.id_expediente, e.id_paciente, p.assigned_doctor_id
       FROM tratamiento t
       LEFT JOIN consulta c ON t.id_consulta = c.id_consulta
       LEFT JOIN expedientes e ON c.id_expediente = e.id_expediente
       LEFT JOIN pacientes p ON e.id_paciente = p.id_paciente
       WHERE t.id_tratamiento = ?`,
      [id]
    );

    if (!tratamiento.length) {
      return res.status(404).json({ message: "Tratamiento no encontrado" });
    }

    // Solo administradores y odontólogos del paciente pueden eliminar
    if (userRole === 'auxiliar') {
      return res.status(403).json({ message: "Los auxiliares no pueden eliminar tratamientos" });
    }

    if (userRole === 'odontologo' && tratamiento[0].assigned_doctor_id !== userId) {
      return res.status(403).json({ message: "No tienes permiso para eliminar este tratamiento" });
    }

    const [r] = await pool.query("DELETE FROM tratamiento WHERE id_tratamiento = ?", [id]);
    if (r.affectedRows === 0) return res.status(404).json({ message: "No encontrado" });
    
    res.json({ message: "Tratamiento eliminado", id_tratamiento: id });
  } catch (err) {
    next(err);
  }
};
