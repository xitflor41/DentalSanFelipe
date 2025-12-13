// src/controllers/auth.controller.js
import { pool } from "../config/db.config.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "cambia_esto";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refresh_secreto_cambia";
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || "8h"; // Usar variable de entorno
const JWT_REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

// Función para convertir tiempo JWT a segundos
function jwtTimeToSeconds(time) {
  const match = time.match(/(\d+)([smhd])/);
  if (!match) return 3600; // default 1 hora
  const value = parseInt(match[1]);
  const unit = match[2];
  
  switch(unit) {
    case 's': return value;
    case 'm': return value * 60;
    case 'h': return value * 3600;
    case 'd': return value * 86400;
    default: return 3600;
  }
}

// Almacenamiento temporal de refresh tokens (en producción usa Redis)
const refreshTokens = [];

export const register = async (req, res, next) => {
  try {
    const { nombre, apellido, username, correo, contrasenna, rol } = req.body;
    
    // Solo administrador puede crear usuarios con rol diferente a odontologo
    if (req.user && req.user.rol !== 'administrador' && rol && rol !== 'odontologo') {
      return res.status(403).json({ message: "Solo administrador puede crear otros roles" });
    }
    
    const [exists] = await pool.query(
      "SELECT id_usuario FROM usuarios WHERE username = ? OR correo = ?", 
      [username, correo]
    );
    if (exists.length) return res.status(409).json({ message: "Usuario o correo ya existe" });
    
    const hash = await bcrypt.hash(contrasenna, 10);
    const [result] = await pool.query(
      "INSERT INTO usuarios (nombre, apellido, username, correo, contrasenna, rol, activo) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [nombre, apellido, username, correo, hash, rol || "odontologo", true]
    );
    
    const [rows] = await pool.query(
      "SELECT id_usuario, nombre, apellido, username, correo, rol, activo FROM usuarios WHERE id_usuario = ?", 
      [result.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "Request body vacío" });
    }
    
    const { usernameOrEmail, password } = req.body;
    const [rows] = await pool.query(
      "SELECT id_usuario, nombre, apellido, username, correo, contrasenna, rol, activo FROM usuarios WHERE (username = ? OR correo = ?) AND activo = TRUE LIMIT 1",
      [usernameOrEmail, usernameOrEmail]
    );
    
    if (!rows.length) return res.status(401).json({ message: "Credenciales inválidas o usuario inactivo" });
    
    const user = rows[0];
    const ok = await bcrypt.compare(password, user.contrasenna);
    if (!ok) return res.status(401).json({ message: "Credenciales inválidas" });
    
    // Generar tokens
    const accessToken = jwt.sign(
      { 
        id_usuario: user.id_usuario, 
        username: user.username, 
        rol: user.rol,
        nombre: user.nombre 
      }, 
      JWT_SECRET, 
      { expiresIn: JWT_EXPIRES }
    );
    
    const refreshToken = jwt.sign(
      { id_usuario: user.id_usuario },
      JWT_REFRESH_SECRET,
      { expiresIn: JWT_REFRESH_EXPIRES }
    );
    
    // Guardar refresh token (en producción usar Redis)
    refreshTokens.push(refreshToken);
    
    delete user.contrasenna;
    res.json({ 
      user, 
      accessToken, 
      refreshToken,
      expiresIn: jwtTimeToSeconds(JWT_EXPIRES)
    });
  } catch (err) {
    next(err);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token requerido" });
    }
    
    // Verificar si el refresh token está en la lista
    if (!refreshTokens.includes(refreshToken)) {
      return res.status(403).json({ message: "Refresh token inválido" });
    }
    
    jwt.verify(refreshToken, JWT_REFRESH_SECRET, async (err, decoded) => {
      if (err) {
        // Eliminar token inválido
        const index = refreshTokens.indexOf(refreshToken);
        if (index > -1) refreshTokens.splice(index, 1);
        return res.status(403).json({ message: "Refresh token expirado o inválido" });
      }
      
      // Buscar usuario
      const [rows] = await pool.query(
        "SELECT id_usuario, username, rol, nombre, activo FROM usuarios WHERE id_usuario = ? AND activo = TRUE",
        [decoded.id_usuario]
      );
      
      if (!rows.length) {
        return res.status(404).json({ message: "Usuario no encontrado o inactivo" });
      }
      
      const user = rows[0];
      
      // Generar nuevo access token
      const newAccessToken = jwt.sign(
        { 
          id_usuario: user.id_usuario, 
          username: user.username, 
          rol: user.rol,
          nombre: user.nombre 
        }, 
        JWT_SECRET, 
        { expiresIn: JWT_EXPIRES }
      );
      
      res.json({ 
        accessToken: newAccessToken,
        expiresIn: jwtTimeToSeconds(JWT_EXPIRES)
      });
    });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (refreshToken) {
      // Eliminar refresh token
      const index = refreshTokens.indexOf(refreshToken);
      if (index > -1) {
        refreshTokens.splice(index, 1);
      }
    }
    
    res.json({ message: "Logout exitoso" });
  } catch (err) {
    next(err);
  }
};