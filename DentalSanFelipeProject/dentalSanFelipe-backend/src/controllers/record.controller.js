// src/controllers/record.controller.js
import { pool } from "../config/db.config.js";
import { softDelete, TABLES, ID_COLUMNS } from "../utils/soft-delete.util.js";

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

/** GET /api/records - listar expedientes (paginado, search por paciente) */
export const getExpedientes = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;
    const q = (req.query.q || "").trim();
    
    // Obtener rol e id del usuario actual
    const userRole = req.user?.rol;
    const userId = req.user?.id_usuario;

    let baseSql = `SELECT e.id_expediente, e.id_paciente, p.nombre AS paciente_nombre, p.apellido AS paciente_apellido,
      e.id_usuario, u.nombre AS odontologo_nombre, u.apellido AS odontologo_apellido,
      e.fechaVisita, e.observaciones, e.created_at
      FROM expedientes e
      LEFT JOIN pacientes p ON e.id_paciente = p.id_paciente
      LEFT JOIN usuarios u ON e.id_usuario = u.id_usuario
      WHERE e.deleted_at IS NULL`;
    const params = [];

    // Si es odontólogo, solo ver sus propios expedientes
    // Los administradores y auxiliares ven todos los expedientes
    if (userRole === 'odontologo') {
      baseSql += " AND e.id_usuario = ?";
      params.push(userId);
    }

    if (q) {
      baseSql += " AND (p.nombre LIKE ? OR p.apellido LIKE ? OR e.observaciones LIKE ?)";
      const like = `%${q}%`;
      params.push(like, like, like);
    }

    const countSql = `SELECT COUNT(*) AS total FROM (${baseSql}) AS sub`;
    const [countRows] = await pool.query(countSql, params);
    const total = countRows[0].total;

    const sql = `${baseSql} ORDER BY e.fechaVisita DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);
    const [rows] = await pool.query(sql, params);

    res.json({ meta: { total, page, limit, pages: Math.ceil(total / limit) }, data: rows });
  } catch (err) {
    next(err);
  }
};

// getExpedienteById -> devuelve expediente + historia + consultas (por id_expediente)
export const getExpedienteById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (!id) return res.status(400).json({ message: "Id inválido" });

    // expediente + paciente + odontologo info
    const [expRows] = await pool.query(
      `SELECT e.*, p.nombre AS paciente_nombre, p.apellido AS paciente_apellido, p.telefono AS paciente_telefono,
              u.nombre AS odontologo_nombre, u.apellido AS odontologo_apellido
       FROM expedientes e
       LEFT JOIN pacientes p ON e.id_paciente = p.id_paciente
       LEFT JOIN usuarios u ON e.id_usuario = u.id_usuario
       WHERE e.id_expediente = ? LIMIT 1`,
      [id]
    );

    if (!expRows.length) return res.status(404).json({ message: "Expediente no encontrado" });
    const expediente = expRows[0];

    // historia clinica
    let historia = null;
    if (expediente.id_historiaClinica) {
      const [hcRows] = await pool.query("SELECT * FROM historia_clinica WHERE id_historiaClinica = ?", [expediente.id_historiaClinica]);
      historia = hcRows[0] || null;
    }

    // consultas vinculadas (por id_expediente) - sin hacer JOIN con tratamiento para evitar errores
    let consultas = [];
    try {
      const [consultasResult] = await pool.query(
        `SELECT * FROM consulta WHERE id_expediente = ? AND deleted_at IS NULL ORDER BY id_consulta DESC`,
        [id]
      );
      consultas = consultasResult;
    } catch (consultaErr) {
      console.error('Error al cargar consultas:', consultaErr);
    }

    res.json({ expediente, historia_clinica: historia, consultas: consultas || [] });
  } catch (err) {
    console.error('Error en getExpedienteById:', err);
    next(err);
  }
};

/** POST /api/records - crear expediente */
export const createExpediente = async (req, res, next) => {
  try {
    const { id_paciente, id_usuario, fechaVisita, observaciones } = req.body;
    if (!id_paciente) return res.status(400).json({ message: "id_paciente requerido" });

    const [result] = await pool.query(
      `INSERT INTO expedientes (id_paciente, id_usuario, fechaVisita, observaciones)
       VALUES (?, ?, ?, ?)`,
      [id_paciente, id_usuario || null, fechaVisita || null, observaciones || null]
    );

    const id_expediente = result.insertId;
    await insertAudit(id_expediente, req.user?.id_usuario, "CREAR_EXPEDIENTE", { id_paciente, id_usuario, observaciones });

    const [rows] = await pool.query("SELECT * FROM expedientes WHERE id_expediente = ?", [id_expediente]);
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

/** PUT /api/records/:id - actualizar expediente */
export const updateExpediente = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { id_usuario, fechaVisita, observaciones, numero_expediente, odontograma } = req.body;
    if (!id) return res.status(400).json({ message: "Id inválido" });

    const [result] = await pool.query(
      `UPDATE expedientes SET id_usuario = ?, fechaVisita = ?, observaciones = ?, numero_expediente = ?, odontograma = ?, updated_at = CURRENT_TIMESTAMP WHERE id_expediente = ?`,
      [id_usuario || null, fechaVisita || null, observaciones || null, numero_expediente || null, odontograma ? JSON.stringify(odontograma) : null, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: "Expediente no encontrado" });

    await insertAudit(id, req.user?.id_usuario, "MODIFICAR_EXPEDIENTE", { id_usuario, fechaVisita, observaciones, numero_expediente });

    const [rows] = await pool.query("SELECT * FROM expedientes WHERE id_expediente = ?", [id]);
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

/** DELETE /api/records/:id */
export const deleteExpediente = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (!id) return res.status(400).json({ message: "Id inválido" });

    const success = await softDelete(TABLES.EXPEDIENTES, ID_COLUMNS.EXPEDIENTES, id, req.user?.id_usuario);
    if (!success) return res.status(404).json({ message: "Expediente no encontrado" });

    await insertAudit(id, req.user?.id_usuario, "SOFT_DELETE_EXPEDIENTE", { deleted_by: req.user?.username });

    res.json({ message: "Expediente eliminado", id_expediente: id });
  } catch (err) {
    next(err);
  }
};

/** POST /api/records/:id/historia - crear o actualizar historia clinica y vincular al expediente */
export const upsertHistoriaClinica = async (req, res, next) => {
  try {
    const id_expediente = parseInt(req.params.id);
    if (!id_expediente) return res.status(400).json({ message: "Id expediente inválido" });

    const { antecedentesFam, antecedentesPrsnls, padecimientosPrevios, factorRiesgo } = req.body;

    // crear historia
    const [result] = await pool.query(
      `INSERT INTO historia_clinica (antecedentesFam, antecedentesPrsnls, padecimientosPrevios, factorRiesgo)
       VALUES (?, ?, ?, ?)`,
      [antecedentesFam || null, antecedentesPrsnls || null, padecimientosPrevios || null, factorRiesgo || null]
    );

    const id_historia = result.insertId;
    // vincular expediente
    await pool.query("UPDATE expedientes SET id_historiaClinica = ? WHERE id_expediente = ?", [id_historia, id_expediente]);

    await insertAudit(id_expediente, req.user?.id_usuario, "CREAR_HISTORIA_CLINICA", { id_historia, antecedentesFam, antecedentesPrsnls });

    const [rows] = await pool.query("SELECT * FROM historia_clinica WHERE id_historiaClinica = ?", [id_historia]);
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

/** POST /api/records/:id/consultas - crear consulta y vincularla al expediente */
export const createConsulta = async (req, res, next) => {
  try {
    const id_expediente = parseInt(req.params.id);
    if (!id_expediente) return res.status(400).json({ message: "Id expediente inválido" });

    const { id_tratamiento, exploracionFisica, diagnostico, notas } = req.body;

    const [result] = await pool.query(
      `INSERT INTO consulta (id_tratamiento, id_expediente, exploracionFisica, diagnostico, notas, realizado_por)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id_tratamiento || null, id_expediente, exploracionFisica || null, diagnostico || null, notas || null, req.user?.id_usuario || null]
    );
    const id_consulta = result.insertId;

    await insertAudit(id_expediente, req.user?.id_usuario, "CREAR_CONSULTA", { id_consulta, diagnostico });

    const [rows] = await pool.query("SELECT * FROM consulta WHERE id_consulta = ?", [id_consulta]);
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};


/** GET /api/records/:id/consultas - listar consultas vinculadas (si hay) */
export const getConsultasByExpediente = async (req, res, next) => {
  try {
    const id_expediente = parseInt(req.params.id);
    if (!id_expediente) return res.status(400).json({ message: "Id expediente inválido" });

    const [rows] = await pool.query(
      `SELECT c.*, t.medicamento, t.dosis, t.viaAdministracion
       FROM consulta c
       LEFT JOIN tratamiento t ON c.id_tratamiento = t.id_tratamiento
       WHERE c.id_expediente = ?
       ORDER BY c.id_consulta DESC`,
      [id_expediente]
    );

    res.json(rows || []);
  } catch (err) {
    next(err);
  }
};



// (Dentro de src/controllers/record.controller.js o nuevo archivo src/controllers/odontogram.controller.js)

/** GET /api/records/:id/odontograma */
export const getOdontograma = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (!id) return res.status(400).json({ message: "Id inválido" });
    const [rows] = await pool.query("SELECT odontograma FROM expedientes WHERE id_expediente = ?", [id]);
    if (!rows.length) return res.status(404).json({ message: "Expediente no encontrado" });
    res.json({ odontograma: rows[0].odontograma || null });
  } catch (err) {
    next(err);
  }
};

/** PUT /api/records/:id/odontograma
 * body: odontograma JSON (estructura libre: array de piezas o mapa)
 */
export const updateOdontograma = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const odontograma = req.body?.odontograma;
    if (!id) return res.status(400).json({ message: "Id inválido" });
    if (odontograma === undefined) return res.status(400).json({ message: "odontograma JSON requerido en body" });

    // Optionally validate structure here (e.g., has pieces 1..32).
    const [r] = await pool.query("UPDATE expedientes SET odontograma = ?, updated_at = CURRENT_TIMESTAMP WHERE id_expediente = ?", [JSON.stringify(odontograma), id]);
    if (r.affectedRows === 0) return res.status(404).json({ message: "Expediente no encontrado" });

    // Audit
    await pool.query("INSERT INTO audit_expedientes (id_expediente, id_usuario, accion, detalle) VALUES (?, ?, ?, ?)", [id, req.user?.id_usuario || null, "MODIFICAR_ODONTOGRAMA", JSON.stringify({ odontograma })]);

    const [rows] = await pool.query("SELECT odontograma FROM expedientes WHERE id_expediente = ?", [id]);
    res.json({ odontograma: rows[0].odontograma });
  } catch (err) {
    next(err);
  }
};

