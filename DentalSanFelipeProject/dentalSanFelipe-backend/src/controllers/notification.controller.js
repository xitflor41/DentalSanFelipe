// src/controllers/notification.controller.js
import { pool } from "../config/db.config.js";

/** 
 * Listar notificaciones de WhatsApp
 * Query params: enviado (true/false), limit
 */
export const getNotifications = async (req, res, next) => {
  try {
    const { enviado } = req.query;
    const limit = Math.min(100, parseInt(req.query.limit) || 50);
    
    let sql = `
      SELECT 
        n.*,
        c.fecha_cita, 
        c.hora_cita,
        c.motivo as cita_motivo,
        p.nombre as paciente_nombre,
        p.apellido as paciente_apellido,
        u.nombre as creado_por_nombre
      FROM notificaciones n 
      LEFT JOIN citas c ON n.id_cita = c.id_cita 
      LEFT JOIN pacientes p ON c.id_paciente = p.id_paciente
      LEFT JOIN usuarios u ON n.creado_por = u.id_usuario
      WHERE 1=1
    `;
    
    const params = [];
    
    if (enviado === "true") { 
      sql += " AND n.enviado = true"; 
    } else if (enviado === "false") { 
      sql += " AND n.enviado = false"; 
    }
    
    sql += " ORDER BY n.created_at DESC LIMIT ?";
    params.push(limit);
    
    const [rows] = await pool.query(sql, params);
    res.json({ data: rows, total: rows.length });
  } catch (err) {
    next(err);
  }
};

/** 
 * Marcar notificación como enviada/fallida manualmente 
 */
export const markNotification = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { enviado, whatsapp_msg_id, detalle_error } = req.body;
    
    if (!id) return res.status(400).json({ message: "Id inválido" });
    
    const [r] = await pool.query(
      `UPDATE notificaciones 
       SET enviado = ?, 
           whatsapp_msg_id = ?, 
           detalle_error = ?,
           fecha_envio = ?
       WHERE id_notificacion = ?`, 
      [enviado ? 1 : 0, whatsapp_msg_id || null, detalle_error || null, enviado ? new Date() : null, id]
    );
    
    if (r.affectedRows === 0) {
      return res.status(404).json({ message: "Notificación no encontrada" });
    }
    
    const [rows] = await pool.query("SELECT * FROM notificaciones WHERE id_notificacion = ?", [id]);
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * Reenviar notificación de WhatsApp
 */
export const resendNotification = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (!id) return res.status(400).json({ message: "Id inválido" });
    
    // Resetear estado para que el worker la procese nuevamente
    const [r] = await pool.query(
      `UPDATE notificaciones 
       SET enviado = FALSE, 
           intentos = 0,
           detalle_error = NULL,
           whatsapp_msg_id = NULL
       WHERE id_notificacion = ?`,
      [id]
    );
    
    if (r.affectedRows === 0) {
      return res.status(404).json({ message: "Notificación no encontrada" });
    }
    
    res.json({ message: "Notificación marcada para reenvío", id_notificacion: id });
  } catch (err) {
    next(err);
  }
};
