// src/controllers/appointments.controller.js
import { pool } from '../config/db.config.js'; // ajusta según tu archivo db
import { formatISO, parseISO, addMinutes } from 'date-fns';
import { sendAppointmentConfirmation } from '../services/whatsapp-twilio.service.js';

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
    const date = req.query.date || null; // Mantener como string YYYY-MM-DD
    const id_usuario = req.query.id_usuario ? parseInt(req.query.id_usuario) : null;
    
    // Obtener rol e id del usuario actual
    const userRole = req.user?.rol;
    const userId = req.user?.id_usuario;

    let sql = `SELECT id_cita, id_paciente, id_expediente, id_usuario, fecha_cita, hora_cita, duracion_min, motivo, estado, created_at, updated_at FROM citas`;
    const params = [];
    const clauses = [];

    // Si es odontólogo, solo ver sus propias citas
    // Los administradores y auxiliares ven todas las citas
    if (userRole === 'odontologo') {
      clauses.push('id_usuario = ?');
      params.push(userId);
    }

    if (date) {
      clauses.push('fecha_cita = ?');
      params.push(date);
    }
    if (id_usuario && userRole !== 'odontologo') {
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

    // Validar formato de fecha_cita
    if (!fecha_cita || typeof fecha_cita !== 'string') {
      return res.status(400).json({ message: 'fecha_cita es requerida y debe ser un string' });
    }

    // comprobar disponibilidad
    const ok = await isSlotAvailable(id_usuario, fecha_cita, duracion_min);
    if (!ok) return res.status(409).json({ message: 'Horario no disponible para el odontólogo seleccionado' });

    // Convertir fecha_cita de formato ISO a MySQL datetime
    // Ejemplo: "2025-12-17T14:30" -> fecha: "2025-12-17", hora: "2025-12-17 14:30:00"
    let fechaHora, fechaSola;
    
    if (fecha_cita.includes('T')) {
      // Formato datetime-local: "2025-12-17T14:30"
      fechaSola = fecha_cita.split('T')[0];
      fechaHora = fecha_cita.replace('T', ' ');
      // Asegurar que tenga segundos
      const parts = fechaHora.split(':');
      if (parts.length === 2) {
        fechaHora += ':00'; // Agregar segundos si solo tiene HH:MM
      }
    } else {
      // Si ya viene en otro formato, intentar parsearlo
      const dt = new Date(fecha_cita);
      fechaSola = dt.toISOString().split('T')[0];
      fechaHora = dt.toISOString().replace('T', ' ').split('.')[0];
    }

    const [result] = await pool.query(
      `INSERT INTO citas (id_paciente, id_usuario, fecha_cita, hora_cita, duracion_min, motivo, estado, creado_por)
       VALUES (?, ?, ?, ?, ?, ?, 'agendada', ?)`,
      [id_paciente, id_usuario, fechaSola, fechaHora, duracion_min, motivo || null, req.user?.id_usuario || null]
    );

    const id_cita = result.insertId;

    // Crear notificación de WhatsApp automática (recordatorio 1 día antes)
    try {
      const [paciente] = await pool.query('SELECT nombre, apellido, telefono FROM pacientes WHERE id_paciente = ?', [id_paciente]);
      if (paciente.length > 0 && paciente[0].telefono) {
        const nombreCompleto = `${paciente[0].nombre} ${paciente[0].apellido || ''}`.trim();
        const fechaFormateada = new Date(fecha_cita).toLocaleDateString('es-MX', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
        const horaFormateada = new Date(fecha_cita).toLocaleTimeString('es-MX', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
        
        const mensaje = `Hola ${nombreCompleto}, te recordamos tu cita dental programada para el ${fechaFormateada} a las ${horaFormateada}.${motivo ? ' Motivo: ' + motivo : ''} ¡Te esperamos!`;
        
        // Programar envío 1 día antes de la cita
        const fechaProgramada = new Date(fecha_cita);
        fechaProgramada.setDate(fechaProgramada.getDate() - 1);
        fechaProgramada.setHours(10, 0, 0, 0); // Enviar a las 10:00 AM del día anterior
        
        await pool.query(
          `INSERT INTO notificaciones (id_cita, telefono, mensaje, fecha_programada, creado_por) 
           VALUES (?, ?, ?, ?, ?)`,
          [id_cita, paciente[0].telefono, mensaje, fechaProgramada, req.user?.id_usuario || null]
        );
      }
    } catch (notifErr) {
      console.error('Error al crear notificación de WhatsApp:', notifErr);
      // No fallar la creación de cita si falla la notificación
    }

    // Enviar confirmación inmediata por WhatsApp
    try {
      const [[paciente]] = await pool.query(
        'SELECT nombre, apellido, telefono FROM pacientes WHERE id_paciente = ?', 
        [id_paciente]
      );
      const [[doctor]] = await pool.query(
        'SELECT nombre, apellido FROM usuarios WHERE id_usuario = ?', 
        [id_usuario]
      );

      if (paciente && paciente.telefono && doctor) {
        const nombrePaciente = `${paciente.nombre} ${paciente.apellido || ''}`.trim();
        const nombreDoctor = `${doctor.nombre} ${doctor.apellido || ''}`.trim();

        await sendAppointmentConfirmation({
          nombrePaciente,
          telefono: paciente.telefono,
          fechaCita: fechaHora,
          nombreDoctor,
          motivo: motivo || null
        });

        console.log('[WhatsApp] Confirmación de cita enviada a:', paciente.telefono);
      }
    } catch (whatsappErr) {
      console.error('[WhatsApp] Error al enviar confirmación:', whatsappErr.message);
      // No fallar la creación de cita si falla el envío de WhatsApp
    }

    const [rows] = await pool.query('SELECT * FROM citas WHERE id_cita = ?', [id_cita]);
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

    // Convertir fecha_cita de formato ISO a MySQL datetime
    let fechaHoraFinal = targetFechaHora;
    let fechaSola = existing.fecha_cita;
    
    if (fecha_cita && typeof fecha_cita === 'string' && fecha_cita.includes('T')) {
      // Formato: "2025-12-16T20:40" -> "2025-12-16 20:40:00"
      fechaHoraFinal = fecha_cita.replace('T', ' ') + ':00';
      fechaSola = fecha_cita.split('T')[0];
    } else if (targetFechaHora !== existing.hora_cita) {
      fechaSola = new Date(targetFechaHora).toISOString().split('T')[0];
    }

    const [result] = await pool.query(
      `UPDATE citas SET id_paciente = ?, id_usuario = ?, fecha_cita = ?, hora_cita = ?, duracion_min = ?, motivo = ?, estado = ?, updated_at = CURRENT_TIMESTAMP WHERE id_cita = ?`,
      [
        id_paciente ?? existing.id_paciente,
        targetUsuario,
        fechaSola,
        fechaHoraFinal,
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
 * DELETE appointment - Soft delete
 */
export const deleteAppointment = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const [result] = await pool.query(
      'UPDATE citas SET deleted_at = NOW(), deleted_by = ? WHERE id_cita = ? AND deleted_at IS NULL',
      [req.user?.id_usuario, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Cita no encontrada' });
    res.json({ message: 'Cita eliminada', id_cita: id });
  } catch (err) {
    next(err);
  }
};
