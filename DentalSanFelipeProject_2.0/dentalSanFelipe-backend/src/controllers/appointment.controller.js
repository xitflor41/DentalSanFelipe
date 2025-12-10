// src/controllers/appointments.controller.js
import { pool } from '../config/db.config.js'; // ajusta según tu archivo db
import { formatISO, parseISO, addMinutes } from 'date-fns';

/**
 * Helper: verifica si existe solapamiento de citas para un odontólogo
 * excludeId opcional: id de cita a excluir (uso en update)
 */
async function isSlotAvailable(id_usuario, startDatetimeISO, duracionMin = 30, excludeId = null) {
  // Convertir strings a Date y calcular fin
  const start = new Date(startDatetimeISO); // asume ISO string o Date compatible
  const end = new Date(start.getTime() + duracionMin * 60000);

  // buscamos citas del mismo odontólogo que se solapen
  // condición de solapamiento: (existing_start < new_end) AND (existing_end > new_start)
  // existing_end = DATE_ADD(hora_cita, INTERVAL duracion_min MINUTE)
  let sql = `SELECT id_cita, hora_cita, duracion_min 
             FROM citas
             WHERE id_usuario = ? 
               AND DATE(fecha_cita) = DATE(?)`; // limitar al mismo día mejora el rendimiento

  const params = [id_usuario, start];

  if (excludeId) {
    sql += ' AND id_cita <> ?';
    params.push(excludeId);
  }

  const [rows] = await pool.query(sql, params);

  for (const r of rows) {
    const existingStart = new Date(r.hora_cita);
    const existingDur = r.duracion_min || 30;
    const existingEnd = new Date(existingStart.getTime() + existingDur * 60000);

    // if (existingStart < end && existingEnd > start) => overlap
    if (existingStart < end && existingEnd > start) return false;
  }

  return true;
}

/**
 * List appointments - soporta filtro por date / id_usuario
 */
export const listAppointments = async (req, res, next) => {
  try {
    const date = req.query.date ? new Date(req.query.date) : null;
    const id_usuario = req.query.id_usuario ? parseInt(req.query.id_usuario) : null;

    let sql = `SELECT id_cita, id_paciente, id_expediente, id_usuario, fecha_cita, hora_cita, duracion_min, motivo, estado, created_at, updated_at FROM citas`;
    const params = [];
    const clauses = [];

    if (date) {
      clauses.push('DATE(fecha_cita) = DATE(?)');
      params.push(date);
    }
    if (id_usuario) {
      clauses.push('id_usuario = ?');
      params.push(id_usuario);
    }
    if (clauses.length) sql += ' WHERE ' + clauses.join(' AND ');
    sql += ' ORDER BY hora_cita ASC';

    const [rows] = await pool.query(sql, params);
    res.json({ data: rows, meta: { total: rows.length } });
  } catch (err) {
    next(err);
  }
};

/**
 * GET by id
 */
export const getAppointmentById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const [rows] = await pool.query('SELECT * FROM citas WHERE id_cita = ?', [id]);
    if (!rows.length) return res.status(404).json({ message: 'Cita no encontrada' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * CREATE appointment
 * Body expects: id_paciente, id_usuario, fecha_cita (ISO datetime), duracion_min?, motivo?
 */
export const createAppointment = async (req, res, next) => {
  try {
    const { id_paciente, id_usuario, fecha_cita, duracion_min = 30, motivo } = req.body;

    // validaciones básicas: paciente y usuario existan
    const [[patient]] = await pool.query('SELECT id_paciente FROM pacientes WHERE id_paciente = ?', [id_paciente]);
    if (!patient) return res.status(400).json({ message: 'Paciente no existe' });

    const [[user]] = await pool.query('SELECT id_usuario FROM usuarios WHERE id_usuario = ?', [id_usuario]);
    if (!user) return res.status(400).json({ message: 'Usuario (odontólogo) no existe' });

    // comprobar disponibilidad
    const ok = await isSlotAvailable(id_usuario, fecha_cita, duracion_min);
    if (!ok) return res.status(409).json({ message: 'Horario no disponible para el odontólogo seleccionado' });

    // extraer fecha (date) y hora (datetime)
    const fecha = new Date(fecha_cita);
    const fechaOnly = fecha.toISOString().split('T')[0]; // YYYY-MM-DD

    const [result] = await pool.query(
      `INSERT INTO citas (id_paciente, id_usuario, fecha_cita, hora_cita, duracion_min, motivo, estado, creado_por)
       VALUES (?, ?, ?, ?, ?, ?, 'agendada', ?)`,
      [id_paciente, id_usuario, fechaOnly, fecha, duracion_min, motivo || null, req.user?.sub || null]
    );

    const [rows] = await pool.query('SELECT * FROM citas WHERE id_cita = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * UPDATE appointment
 */
export const updateAppointment = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { id_paciente, id_usuario, fecha_cita, duracion_min, motivo, estado } = req.body;

    // validar existencia
    const [found] = await pool.query('SELECT * FROM citas WHERE id_cita = ?', [id]);
    if (!found.length) return res.status(404).json({ message: 'Cita no encontrada' });
    const existing = found[0];

    // si cambian id_usuario/fecha_cita/duracion_min => comprobar disponibilidad
    const targetUsuario = id_usuario ?? existing.id_usuario;
    const targetFechaHora = fecha_cita ?? existing.hora_cita;
    const targetDur = duracion_min ?? existing.duracion_min ?? 30;

    const ok = await isSlotAvailable(targetUsuario, targetFechaHora, targetDur, id);
    if (!ok) return res.status(409).json({ message: 'Horario no disponible para el odontólogo seleccionado' });

    // Preparar valores (si fecha_cita es Date/ISO, extraer fecha)
    const fechaOnly = targetFechaHora ? new Date(targetFechaHora).toISOString().split('T')[0] : existing.fecha_cita;

    const [result] = await pool.query(
      `UPDATE citas SET id_paciente = ?, id_usuario = ?, fecha_cita = ?, hora_cita = ?, duracion_min = ?, motivo = ?, estado = ?, updated_at = CURRENT_TIMESTAMP WHERE id_cita = ?`,
      [
        id_paciente ?? existing.id_paciente,
        targetUsuario,
        fechaOnly,
        targetFechaHora ?? existing.hora_cita,
        targetDur,
        motivo ?? existing.motivo,
        estado ?? existing.estado,
        id
      ]
    );

    const [rows] = await pool.query('SELECT * FROM citas WHERE id_cita = ?', [id]);
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE appointment
 */
export const deleteAppointment = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const [result] = await pool.query('DELETE FROM citas WHERE id_cita = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Cita no encontrada' });
    res.json({ message: 'Cita eliminada', id_cita: id });
  } catch (err) {
    next(err);
  }
};
