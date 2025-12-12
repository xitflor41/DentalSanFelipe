// src/routes/health.routes.js
import express from "express";
import { pool } from "../config/db.config.js";

const router = express.Router();

router.get("/health", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1+1 AS ok");
    res.json({ status: "ok", db: rows[0].ok === 2 });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
});

export default router;
