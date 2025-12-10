// src/controllers/notification.controller.js
import { pool } from "../config/db.config.js";

/** Listar notificaciones (filtros: enviado) */
export const getNotifications = async (req, res, next) => {
  try {
    const { enviado } = req.query;
    let sql = "SELECT n.*, c.fecha_cita, c.hora_cita, p.telefono FROM notificaciones n LEFT JOIN citas c ON n.id_cita = c.id_cita LEFT JOIN pacientes p ON c.id_paciente = p.id_paciente WHERE 1=1";
    const params = [];
    if (enviado === "true") { sql += " AND n.enviado = true"; }
    else if (enviado === "false") { sql += " AND n.enviado = false"; }
    sql += " ORDER BY n.fecha_envio DESC LIMIT 100";
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

/** Marcar manualmente como enviado/failed */
export const markNotification = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { enviado, provider_msg_id, detalle_error } = req.body;
    if (!id) return res.status(400).json({ message: "Id inválido" });
    const [r] = await pool.query("UPDATE notificaciones SET enviado = ?, provider_msg_id = ?, detalle_error = ? WHERE id_notificacion = ?", [enviado ? 1 : 0, provider_msg_id || null, detalle_error || null, id]);
    if (r.affectedRows === 0) return res.status(404).json({ message: "Notificacion no encontrada" });
    const [rows] = await pool.query("SELECT * FROM notificaciones WHERE id_notificacion = ?", [id]);
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};
