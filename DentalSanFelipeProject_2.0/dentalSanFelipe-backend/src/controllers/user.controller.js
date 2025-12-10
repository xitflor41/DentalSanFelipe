// src/controllers/users.controller.js
import { pool } from "../config/db.config.js";
import bcrypt from "bcrypt";

export const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, rol, search } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT 
        id_usuario, nombre, apellido, username, correo, rol, 
        activo, created_at, updated_at 
      FROM usuarios 
      WHERE 1=1
    `;
    
    const params = [];
    
    if (rol) {
      query += " AND rol = ?";
      params.push(rol);
    }
    
    if (search) {
      query += " AND (nombre LIKE ? OR apellido LIKE ? OR username LIKE ? OR correo LIKE ?)";
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    query += " ORDER BY nombre, apellido LIMIT ? OFFSET ?";
    params.push(parseInt(limit), parseInt(offset));
    
    const [rows] = await pool.query(query, params);
    
    // Total count
    let countQuery = "SELECT COUNT(*) as total FROM usuarios WHERE 1=1";
    const countParams = params.slice(0, params.length - 2); // Remover limit y offset
    
    const [countResult] = await pool.query(countQuery, countParams);
    
    res.json({
      users: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const [rows] = await pool.query(
      `SELECT id_usuario, nombre, apellido, username, correo, rol, 
       activo, created_at, updated_at 
       FROM usuarios WHERE id_usuario = ?`,
      [id]
    );
    
    if (!rows.length) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { nombre, apellido, username, correo, contrasenna, rol, activo = true } = req.body;
    
    // Validar que el administrador no se pueda crear a sí mismo o cambiar su rol
    if (req.user.id_usuario && rol && rol !== req.user.rol) {
      // Solo admin puede crear otros admin
      if (rol === 'administrador' && req.user.rol !== 'administrador') {
        return res.status(403).json({ message: "Solo administradores pueden crear otros administradores" });
      }
    }
    
    // Verificar si usuario o correo ya existen
    const [exists] = await pool.query(
      "SELECT id_usuario FROM usuarios WHERE username = ? OR correo = ?",
      [username, correo]
    );
    
    if (exists.length) {
      return res.status(409).json({ message: "Username o correo ya registrado" });
    }
    
    // Hash de contraseña
    const hash = await bcrypt.hash(contrasenna, 10);
    
    const [result] = await pool.query(
      `INSERT INTO usuarios 
       (nombre, apellido, username, correo, contrasenna, rol, activo) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nombre, apellido, username, correo, hash, rol || 'odontologo', activo]
    );
    
    // Obtener usuario creado (sin contraseña)
    const [rows] = await pool.query(
      `SELECT id_usuario, nombre, apellido, username, correo, rol, activo 
       FROM usuarios WHERE id_usuario = ?`,
      [result.insertId]
    );
    
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, username, correo, rol, activo, contrasenna } = req.body;
    
    // Verificar que el usuario existe
    const [existing] = await pool.query(
      "SELECT id_usuario, rol FROM usuarios WHERE id_usuario = ?",
      [id]
    );
    
    if (!existing.length) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    
    // Validaciones de seguridad
    const existingUser = existing[0];
    
    // No permitir que un usuario se modifique a sí mismo ciertos campos
    if (req.user.id_usuario == id) {
      if (rol && rol !== req.user.rol) {
        return res.status(403).json({ 
          message: "No puedes cambiar tu propio rol" 
        });
      }
      
      if (activo !== undefined && activo === false) {
        return res.status(403).json({ 
          message: "No puedes desactivar tu propia cuenta" 
        });
      }
    }
    
    // Solo admin puede crear otros admin o cambiar roles a admin
    if (rol === 'administrador' && req.user.rol !== 'administrador') {
      return res.status(403).json({ 
        message: "Solo administradores pueden asignar rol de administrador" 
      });
    }
    
    // Construir query dinámica
    const updates = [];
    const params = [];
    
    if (nombre !== undefined) {
      updates.push("nombre = ?");
      params.push(nombre);
    }
    
    if (apellido !== undefined) {
      updates.push("apellido = ?");
      params.push(apellido);
    }
    
    if (username !== undefined) {
      // Verificar que username no esté en uso por otro usuario
      const [usernameCheck] = await pool.query(
        "SELECT id_usuario FROM usuarios WHERE username = ? AND id_usuario != ?",
        [username, id]
      );
      
      if (usernameCheck.length) {
        return res.status(409).json({ message: "Username ya está en uso" });
      }
      
      updates.push("username = ?");
      params.push(username);
    }
    
    if (correo !== undefined) {
      // Verificar que correo no esté en uso por otro usuario
      const [emailCheck] = await pool.query(
        "SELECT id_usuario FROM usuarios WHERE correo = ? AND id_usuario != ?",
        [correo, id]
      );
      
      if (emailCheck.length) {
        return res.status(409).json({ message: "Correo ya está en uso" });
      }
      
      updates.push("correo = ?");
      params.push(correo);
    }
    
    if (rol !== undefined) {
      updates.push("rol = ?");
      params.push(rol);
    }
    
    if (activo !== undefined) {
      updates.push("activo = ?");
      params.push(activo);
    }
    
    if (contrasenna !== undefined) {
      const hash = await bcrypt.hash(contrasenna, 10);
      updates.push("contrasenna = ?");
      params.push(hash);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ message: "No hay campos para actualizar" });
    }
    
    params.push(id); // Para el WHERE
    
    const query = `UPDATE usuarios SET ${updates.join(", ")} WHERE id_usuario = ?`;
    
    await pool.query(query, params);
    
    // Obtener usuario actualizado
    const [rows] = await pool.query(
      `SELECT id_usuario, nombre, apellido, username, correo, rol, activo 
       FROM usuarios WHERE id_usuario = ?`,
      [id]
    );
    
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // No permitir eliminarse a sí mismo
    if (req.user.id_usuario == id) {
      return res.status(403).json({ 
        message: "No puedes eliminar tu propia cuenta" 
      });
    }
    
    // Verificar que el usuario existe
    const [existing] = await pool.query(
      "SELECT id_usuario, rol FROM usuarios WHERE id_usuario = ?",
      [id]
    );
    
    if (!existing.length) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    
    // Solo admin puede eliminar otros admin
    const userToDelete = existing[0];
    if (userToDelete.rol === 'administrador' && req.user.rol !== 'administrador') {
      return res.status(403).json({ 
        message: "Solo administradores pueden eliminar otros administradores" 
      });
    }
    
    // Eliminar usuario (soft delete o hard delete)
    // Opción 1: Soft delete (recomendado)
    // await pool.query("UPDATE usuarios SET activo = FALSE WHERE id_usuario = ?", [id]);
    
    // Opción 2: Hard delete
    await pool.query("DELETE FROM usuarios WHERE id_usuario = ?", [id]);
    
    res.json({ 
      message: "Usuario eliminado correctamente",
      deletedId: id
    });
  } catch (err) {
    next(err);
  }
};

export const getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user.id_usuario;
    
    const [rows] = await pool.query(
      `SELECT id_usuario, nombre, apellido, username, correo, rol, activo 
       FROM usuarios WHERE id_usuario = ?`,
      [userId]
    );
    
    if (!rows.length) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};