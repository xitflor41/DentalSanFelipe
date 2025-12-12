import bcrypt from "bcrypt";
import { pool } from "../config/db.config.js";

const run = async () => {
  const pass = process.env.SEED_ADMIN_PASS || "Admin123!";
  const hash = await bcrypt.hash(pass, 10);
  try {
    const [exists] = await pool.query("SELECT id_usuario FROM usuarios WHERE username = 'admin' LIMIT 1");
    if (exists.length) {
      console.log("Admin ya existe");
      process.exit(0);
    }
    const [r] = await pool.query(
      "INSERT INTO usuarios (nombre, apellido, username, correo, contrasenna, rol) VALUES (?, ?, ?, ?, ?, ?)",
      ["Admin", "Local", "admin", "admin@local", hash, "administrador"]
    );
    console.log("Admin creado, id:", r.insertId);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
};

run();
