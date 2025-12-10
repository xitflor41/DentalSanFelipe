// src/test-db.js
import { pool } from "./config/db.config.js";

const run = async () => {
  try {
    console.log("🔌 Probando conexión a la BD...");
    const [rows] = await pool.query("SELECT 1 + 1 AS resultado");
    console.log("✅ Conexión OK — resultado:", rows[0]);
    // Ejemplo adicional: contar tablas
    const [tables] = await pool.query("SELECT COUNT(*) AS tablas FROM information_schema.tables WHERE table_schema = DATABASE()");
    console.log("ℹ️ Tablas en la BD:", tables[0].tablas);
    process.exit(0);
  } catch (err) {
    console.error("❌ Error de conexión a la BD:", err.message);
    console.error(err);
    process.exit(1);
  }
};

run();
