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
    
    // Obtener rol e id del usuario actual
    const userRole = req.user?.rol;
    const userId = req.user?.id_usuario;

    let selectFields;
    let baseSql;
    const params = [];
    const conditions = [];

    // Filtrado por rol:
    // - Administrador: ve TODOS los pacientes con todos los campos
    // - Odontólogo: solo pacientes asignados (assigned_doctor_id = userId)
    // - Auxiliar: solo campos no sensibles (id, nombre, apellido, telefono)
    if (userRole === 'administrador') {
      selectFields = "p.*";
      baseSql = "SELECT p.* FROM pacientes p";
    } else if (userRole === 'odontologo') {
      selectFields = "p.*";
      baseSql = "SELECT p.* FROM pacientes p";
      conditions.push("p.assigned_doctor_id = ?");
      params.push(userId);
    } else if (userRole === 'auxiliar') {
      selectFields = "p.id_paciente, p.nombre, p.apellido, p.telefono";
      baseSql = "SELECT p.id_paciente, p.nombre, p.apellido, p.telefono FROM pacientes p";
    }

    if (q) {
      conditions.push("(p.nombre LIKE ? OR p.apellido LIKE ? OR p.telefono LIKE ?)");
      const like = `%${q}%`;
      params.push(like, like, like);
    }

    if (conditions.length > 0) {
      baseSql += " WHERE " + conditions.join(" AND ");
    }

    // Contar total
    const countParams = [...params];
    const countSql = baseSql.replace(/SELECT .+ FROM pacientes p/, "SELECT COUNT(*) as total FROM pacientes p");
    const [countRows] = await pool.query(countSql, countParams);
    const total = countRows[0].total;

    // Obtener datos paginados
    const sql = `${baseSql} ORDER BY p.id_paciente DESC LIMIT ? OFFSET ?`;
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

    const userRole = req.user?.rol;
    const userId = req.user?.id_usuario;

    let sql;
    const params = [id];

    // Administrador: ve todos los campos
    // Odontólogo: solo si está asignado
    // Auxiliar: solo campos no sensibles
    if (userRole === 'administrador') {
      sql = "SELECT * FROM pacientes WHERE id_paciente = ?";
    } else if (userRole === 'odontologo') {
      sql = "SELECT * FROM pacientes WHERE id_paciente = ? AND assigned_doctor_id = ?";
      params.push(userId);
    } else if (userRole === 'auxiliar') {
      sql = "SELECT id_paciente, nombre, apellido, telefono FROM pacientes WHERE id_paciente = ?";
    }

    const [rows] = await pool.query(sql, params);

    if (!rows.length) {
      return res.status(userRole === 'odontologo' ? 403 : 404).json({ 
        message: userRole === 'odontologo' ? "No tienes acceso a este paciente" : "Paciente no encontrado" 
      });
    }

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
    const { nombre, apellido, telefono, sexo, fecha_nac, assigned_doctor_id } = req.body;
    const userId = req.user?.id_usuario;
    const userRole = req.user?.rol;

    // Si es odontólogo y no se especifica assigned_doctor_id, se asigna a sí mismo
    const assignedDoctorId = userRole === 'odontologo' && !assigned_doctor_id ? userId : assigned_doctor_id;

    const [result] = await pool.query(
      "INSERT INTO pacientes (nombre, apellido, telefono, sexo, fecha_nac, created_by, assigned_doctor_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [nombre, apellido || null, telefono || null, sexo || null, fecha_nac || null, userId, assignedDoctorId]
    );

    const [rows] = await pool.query("SELECT * FROM pacientes WHERE id_paciente = ?", [result.insertId]);
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

    const userRole = req.user?.rol;
    const userId = req.user?.id_usuario;

    // Auxiliar no puede editar
    if (userRole === 'auxiliar') {
      return res.status(403).json({ message: "No tienes permiso para editar pacientes" });
    }

    // Odontólogo solo puede editar pacientes asignados
    if (userRole === 'odontologo') {
      const [check] = await pool.query(
        "SELECT id_paciente FROM pacientes WHERE id_paciente = ? AND assigned_doctor_id = ?",
        [id, userId]
      );
      if (!check.length) {
        return res.status(403).json({ message: "No tienes acceso a este paciente" });
      }
    }

    const { nombre, apellido, telefono, sexo, fecha_nac } = req.body;

    const [result] = await pool.query(
      `UPDATE pacientes SET nombre = ?, apellido = ?, telefono = ?, sexo = ?, fecha_nac = ?, updated_at = CURRENT_TIMESTAMP WHERE id_paciente = ?`,
      [nombre, apellido || null, telefono || null, sexo || null, fecha_nac || null, id]
    );

    if (result.affectedRows === 0) return res.status(404).json({ message: "Paciente no encontrado" });

    const [rows] = await pool.query("SELECT * FROM pacientes WHERE id_paciente = ?", [id]);
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/patients/:id
 * Only admin can delete patients (safety)
 * NOTA: Pacientes NO se eliminan físicamente por requisitos legales
 * Se mantiene DELETE físico solo para admin, pero se recomienda soft delete en historia_clinica
 */
export const deletePatient = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (!id) return res.status(400).json({ message: "Id inválido" });

    // Verificar que el usuario es administrador
    if (req.user?.rol !== 'administrador') {
      return res.status(403).json({ message: "Solo administradores pueden eliminar pacientes" });
    }

    const [result] = await pool.query("DELETE FROM pacientes WHERE id_paciente = ?", [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Paciente no encontrado" });

    res.json({ message: "Paciente eliminado correctamente", id_paciente: id });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/patients/:id/historia
 * Obtener historia clínica de un paciente
 */
export const getHistoriaByPaciente = async (req, res, next) => {
  try {
    const id_paciente = parseInt(req.params.id);
    if (!id_paciente) return res.status(400).json({ message: "Id de paciente inválido" });

    const [rows] = await pool.query(
      "SELECT * FROM historia_clinica WHERE id_paciente = ?",
      [id_paciente]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Historia clínica no encontrada" });
    }

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/patients/:id/historia
 * Crear o actualizar historia clínica de un paciente
 */
export const upsertHistoriaByPaciente = async (req, res, next) => {
  try {
    const id_paciente = parseInt(req.params.id);
    if (!id_paciente) return res.status(400).json({ message: "Id de paciente inválido" });

    // Verificar que el paciente existe
    const [paciente] = await pool.query(
      "SELECT id_paciente FROM pacientes WHERE id_paciente = ?",
      [id_paciente]
    );
    if (paciente.length === 0) {
      return res.status(404).json({ message: "Paciente no encontrado" });
    }

    const { antecedentesFam, antecedentesPrsnls, padecimientosPrevios, factorRiesgo, alergias } = req.body;

    // Verificar si ya existe historia para este paciente
    const [existing] = await pool.query(
      "SELECT id_historiaClinica FROM historia_clinica WHERE id_paciente = ?",
      [id_paciente]
    );

    if (existing.length > 0) {
      // Actualizar
      await pool.query(
        `UPDATE historia_clinica SET 
          antecedentesFam = ?, 
          antecedentesPrsnls = ?, 
          padecimientosPrevios = ?, 
          factorRiesgo = ?, 
          alergias = ?
        WHERE id_paciente = ?`,
        [antecedentesFam, antecedentesPrsnls, padecimientosPrevios, factorRiesgo, alergias, id_paciente]
      );

      res.json({ 
        message: "Historia clínica actualizada", 
        id_historiaClinica: existing[0].id_historiaClinica,
        id_paciente 
      });
    } else {
      // Crear nueva
      const [result] = await pool.query(
        `INSERT INTO historia_clinica 
          (id_paciente, antecedentesFam, antecedentesPrsnls, padecimientosPrevios, factorRiesgo, alergias) 
        VALUES (?, ?, ?, ?, ?, ?)`,
        [id_paciente, antecedentesFam, antecedentesPrsnls, padecimientosPrevios, factorRiesgo, alergias]
      );

      res.status(201).json({ 
        message: "Historia clínica creada", 
        id_historiaClinica: result.insertId,
        id_paciente 
      });
    }
  } catch (err) {
    next(err);
  }
};
