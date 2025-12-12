// src/workers/notification.worker.js
import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 5
});

// Configuración desde variables de entorno
const SEND_SIMULATED = process.env.WHATSAPP_SIMULATION_MODE === 'true';
const WORKER_INTERVAL = Number(process.env.NOTIFICATION_WORKER_INTERVAL) || 30000;
const MAX_RETRIES = Number(process.env.NOTIFICATION_MAX_RETRIES) || 3;
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';

/**
 * Procesa lote de notificaciones pendientes de WhatsApp
 */
async function processBatch() {
  try {
    // Buscar notificaciones pendientes cuya fecha programada ya pasó
    const [pending] = await pool.query(
      `SELECT 
        n.id_notificacion, 
        n.id_cita, 
        n.telefono, 
        n.mensaje,
        n.intentos
      FROM notificaciones n
      WHERE n.enviado = false 
        AND (n.fecha_programada IS NULL OR n.fecha_programada <= NOW())
        AND n.intentos < ?
      LIMIT 10`,
      [MAX_RETRIES]
    );
    
    if (!pending.length) {
      return; // Nada que procesar
    }
    
    for (const row of pending) {
      try {
        // Incrementar intentos
        await pool.query(
          "UPDATE notificaciones SET intentos = intentos + 1 WHERE id_notificacion = ?", 
          [row.id_notificacion]
        );

        if (SEND_SIMULATED) {
          // Modo simulación para desarrollo
          console.log(`[WhatsApp Worker] 📱 Simulando envío a ${row.telefono}`);
          console.log(`[WhatsApp Worker] 💬 Mensaje: ${row.mensaje.substring(0, 50)}...`);
          
          const mockMsgId = `wamid.mock_${Date.now()}_${row.id_notificacion}`;
          
          await pool.query(
            `UPDATE notificaciones 
             SET enviado = TRUE, 
                 whatsapp_msg_id = ?, 
                 detalle_error = NULL, 
                 fecha_envio = CURRENT_TIMESTAMP 
             WHERE id_notificacion = ?`,
            [mockMsgId, row.id_notificacion]
          );
          
          console.log(`[WhatsApp Worker] ✅ Notificación ${row.id_notificacion} marcada como enviada`);
        } else {
          // Integración real con Twilio WhatsApp API
          if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
            throw new Error('Credenciales de Twilio no configuradas. Revisa el archivo .env');
          }

          // Importación dinámica de twilio (requiere: npm install twilio)
          const twilio = await import('twilio');
          const client = twilio.default(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
          
          console.log(`[WhatsApp Worker] 📱 Enviando mensaje real a ${row.telefono}`);
          
          const message = await client.messages.create({
            from: TWILIO_WHATSAPP_FROM,
            body: row.mensaje,
            to: `whatsapp:${row.telefono}`
          });
          
          await pool.query(
            `UPDATE notificaciones 
             SET enviado = TRUE, 
                 whatsapp_msg_id = ?, 
                 detalle_error = NULL,
                 fecha_envio = CURRENT_TIMESTAMP 
             WHERE id_notificacion = ?`,
            [message.sid, row.id_notificacion]
          );
          
          console.log(`[WhatsApp Worker] ✅ Mensaje enviado. SID: ${message.sid}`);
        }
      } catch (err) {
        console.error(`[WhatsApp Worker] ❌ Error enviando notificación ${row.id_notificacion}:`, err.message);
        
        await pool.query(
          `UPDATE notificaciones 
           SET detalle_error = ?, 
               enviado = FALSE 
           WHERE id_notificacion = ?`,
          [err.message, row.id_notificacion]
        );
      }
    }
  } catch (err) {
    console.error("[WhatsApp Worker] Fatal error:", err);
  }
}

async function loop() {
  console.log("[WhatsApp Worker] 🚀 Iniciando worker de notificaciones WhatsApp...");
  console.log(`[WhatsApp Worker] 📋 Modo: ${SEND_SIMULATED ? 'SIMULACIÓN' : 'PRODUCCIÓN'}`);
  console.log(`[WhatsApp Worker] ⏱️  Intervalo: ${WORKER_INTERVAL / 1000} segundos`);
  console.log(`[WhatsApp Worker] 🔄 Reintentos máximos: ${MAX_RETRIES}`);
  
  if (!SEND_SIMULATED) {
    console.log(`[WhatsApp Worker] 📞 Número Twilio: ${TWILIO_WHATSAPP_FROM}`);
  }
  
  while (true) {
    await processBatch();
    await new Promise(r => setTimeout(r, WORKER_INTERVAL));
  }
}

loop().catch(err => {
  console.error("[WhatsApp Worker] Fatal error:", err);
  process.exit(1);
});
