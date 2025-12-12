// src/middlewares/access-control.middleware.js
// Middleware para control de acceso granular a recursos clínicos

import { pool } from "../config/db.config.js";

/**
 * Verifica que el usuario tenga permiso para acceder a expedientes
 * Reglas:
 * - Administradores: Acceso completo
 * - Odontólogos: Acceso completo a sus expedientes y los no asignados
 * - Auxiliares: Solo lectura
 */
export const canAccessExpediente = (requiredPermission = 'read') => {
  return async (req, res, next) => {
    try {
      const { rol, id_usuario } = req.user;
      const expedienteId = req.params.id || req.params.id_expediente || req.body.id_expediente;

      // Administradores tienen acceso completo
      if (rol === 'administrador') {
        return next();
      }

      // Verificar si el expediente existe y obtener el odontólogo responsable
      const [rows] = await pool.query(
        'SELECT id_usuario FROM expedientes WHERE id_expediente = ? AND deleted_at IS NULL',
        [expedienteId]
      );

      if (!rows.length) {
        return res.status(404).json({ message: 'Expediente no encontrado' });
      }

      const expediente = rows[0];

      // Odontólogos pueden leer/escribir sus expedientes
      if (rol === 'odontologo') {
        // Si el expediente no tiene odontólogo asignado o es el suyo, puede acceder
        if (!expediente.id_usuario || expediente.id_usuario === id_usuario) {
          return next();
        }
        // Si requiere solo lectura, puede ver expedientes de otros odontólogos
        if (requiredPermission === 'read') {
          return next();
        }
        return res.status(403).json({ 
          message: 'No tienes permiso para modificar expedientes de otros odontólogos' 
        });
      }

      // Auxiliares solo pueden leer
      if (rol === 'auxiliar') {
        if (requiredPermission === 'read') {
          return next();
        }
        return res.status(403).json({ 
          message: 'Los auxiliares solo tienen permisos de lectura' 
        });
      }

      return res.status(403).json({ message: 'Acceso denegado' });
    } catch (error) {
      console.error('Error en canAccessExpediente:', error);
      return res.status(500).json({ message: 'Error verificando permisos' });
    }
  };
};

/**
 * Verifica que el usuario tenga permiso para modificar historia clínica
 * Reglas:
 * - Administradores: Acceso completo
 * - Odontólogos: Pueden crear y modificar historias clínicas
 * - Auxiliares: Solo lectura
 */
export const canModifyHistoriaClinica = (req, res, next) => {
  const { rol } = req.user;

  if (rol === 'administrador' || rol === 'odontologo') {
    return next();
  }

  if (rol === 'auxiliar') {
    return res.status(403).json({ 
      message: 'Los auxiliares no pueden modificar historias clínicas' 
    });
  }

  return res.status(403).json({ message: 'Acceso denegado' });
};

/**
 * Verifica que el usuario pueda acceder a datos de un paciente específico
 */
export const canAccessPaciente = async (req, res, next) => {
  try {
    const { rol } = req.user;
    const pacienteId = req.params.id || req.params.id_paciente;

    // Administradores y odontólogos tienen acceso completo
    if (rol === 'administrador' || rol === 'odontologo') {
      return next();
    }

    // Auxiliares solo pueden leer
    if (rol === 'auxiliar' && req.method === 'GET') {
      return next();
    }

    return res.status(403).json({ 
      message: 'No tienes permiso para realizar esta acción' 
    });
  } catch (error) {
    console.error('Error en canAccessPaciente:', error);
    return res.status(500).json({ message: 'Error verificando permisos' });
  }
};

/**
 * Verifica permisos para eliminar registros
 * Solo administradores y odontólogos pueden eliminar (soft delete)
 */
export const canDelete = (req, res, next) => {
  const { rol } = req.user;

  if (rol === 'administrador' || rol === 'odontologo') {
    return next();
  }

  return res.status(403).json({ 
    message: 'No tienes permisos para eliminar registros' 
  });
};

/**
 * Registra el acceso a expedientes para auditoría
 */
export const logExpedienteAccess = async (req, res, next) => {
  try {
    const { id_usuario, username } = req.user;
    const expedienteId = req.params.id || req.params.id_expediente;
    const action = `${req.method} ${req.path}`;

    // Registrar en audit_expedientes
    await pool.query(
      `INSERT INTO audit_expedientes (id_expediente, id_usuario, accion, detalle, ip_address, user_agent) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        expedienteId,
        id_usuario,
        'ACCESS',
        JSON.stringify({ 
          action,
          username,
          timestamp: new Date().toISOString()
        }),
        req.ip || req.connection.remoteAddress,
        req.headers['user-agent']
      ]
    );

    next();
  } catch (error) {
    console.error('Error logging access:', error);
    // No bloquear la request si falla el logging
    next();
  }
};
