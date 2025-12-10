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

const SEND_SIMULATED = true; // set false si integras provider real

async function processBatch() {
  try {
    const [pending] = await pool.query("SELECT n.id_notificacion, n.id_cita, n.mensaje, p.telefono FROM notificaciones n LEFT JOIN citas c ON n.id_cita = c.id_cita LEFT JOIN pacientes p ON c.id_paciente = p.id_paciente WHERE n.enviado = false LIMIT 10");
    if (!pending.length) {
      // nothing to do
      return;
    }
    for (const row of pending) {
      try {
        // Aquí integra tu provider (Twilio / Meta) — ejemplo mock:
        if (SEND_SIMULATED) {
          console.log(`[worker] Simulando envío a ${row.telefono} -> ${row.mensaje}`);
          // Simula id del proveedor
          const providerId = `mock-${Date.now()}-${row.id_notificacion}`;
          await pool.query("UPDATE notificaciones SET enviado = TRUE, provider_msg_id = ?, detalle_error = NULL, fecha_envio = CURRENT_TIMESTAMP WHERE id_notificacion = ?", [providerId, row.id_notificacion]);
        } else {
          // Integración real: llamar API del proveedor y actualizar según respuesta
        }
      } catch (err) {
        console.error("[worker] error enviando notificacion id", row.id_notificacion, err.message);
        await pool.query("UPDATE notificaciones SET enviado = FALSE, detalle_error = ? WHERE id_notificacion = ?", [err.message, row.id_notificacion]);
      }
    }
  } catch (err) {
    console.error("[worker] fatal", err);
  }
}

async function loop() {
  while (true) {
    await processBatch();
    // espera entre ciclos (ej: 20s)
    await new Promise(r => setTimeout(r, 20000));
  }
}

loop().catch(err => {
  console.error("Worker error", err);
  process.exit(1);
});
