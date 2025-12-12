// src/utils/soft-delete.util.js
// Utilidades para manejo de soft delete en tablas clínicas

import { pool } from "../config/db.config.js";

/**
 * Realiza soft delete de un registro
 * @param {string} table - Nombre de la tabla
 * @param {string} idColumn - Nombre de la columna ID
 * @param {number} id - ID del registro a eliminar
 * @param {number} deletedBy - ID del usuario que elimina
 * @returns {Promise<boolean>} - true si se eliminó correctamente
 */
export async function softDelete(table, idColumn, id, deletedBy) {
  try {
    const [result] = await pool.query(
      `UPDATE ${table} 
       SET deleted_at = NOW(), deleted_by = ? 
       WHERE ${idColumn} = ? AND deleted_at IS NULL`,
      [deletedBy, id]
    );
    
    return result.affectedRows > 0;
  } catch (error) {
    console.error(`Error en soft delete de ${table}:`, error);
    throw error;
  }
}

/**
 * Restaura un registro eliminado
 * @param {string} table - Nombre de la tabla
 * @param {string} idColumn - Nombre de la columna ID
 * @param {number} id - ID del registro a restaurar
 * @returns {Promise<boolean>} - true si se restauró correctamente
 */
export async function restore(table, idColumn, id) {
  try {
    const [result] = await pool.query(
      `UPDATE ${table} 
       SET deleted_at = NULL, deleted_by = NULL 
       WHERE ${idColumn} = ? AND deleted_at IS NOT NULL`,
      [id]
    );
    
    return result.affectedRows > 0;
  } catch (error) {
    console.error(`Error restaurando ${table}:`, error);
    throw error;
  }
}

/**
 * Obtiene registros activos (no eliminados)
 * @param {string} table - Nombre de la tabla
 * @param {object} conditions - Condiciones WHERE adicionales
 * @returns {Promise<Array>} - Registros activos
 */
export async function getActive(table, conditions = {}) {
  try {
    let query = `SELECT * FROM ${table} WHERE deleted_at IS NULL`;
    const params = [];

    // Agregar condiciones adicionales
    Object.entries(conditions).forEach(([key, value]) => {
      query += ` AND ${key} = ?`;
      params.push(value);
    });

    const [rows] = await pool.query(query, params);
    return rows;
  } catch (error) {
    console.error(`Error obteniendo registros activos de ${table}:`, error);
    throw error;
  }
}

/**
 * Verifica si un registro está activo (no eliminado)
 * @param {string} table - Nombre de la tabla
 * @param {string} idColumn - Nombre de la columna ID
 * @param {number} id - ID del registro
 * @returns {Promise<boolean>} - true si está activo
 */
export async function isActive(table, idColumn, id) {
  try {
    const [rows] = await pool.query(
      `SELECT 1 FROM ${table} WHERE ${idColumn} = ? AND deleted_at IS NULL`,
      [id]
    );
    return rows.length > 0;
  } catch (error) {
    console.error(`Error verificando si registro está activo en ${table}:`, error);
    throw error;
  }
}

/**
 * Ejecuta una transacción con rollback automático en caso de error
 * @param {Function} callback - Función async que recibe la conexión
 * @returns {Promise<any>} - Resultado de la transacción
 */
export async function transaction(callback) {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Registra una operación en la tabla de auditoría
 * @param {number} idExpediente - ID del expediente
 * @param {number} idUsuario - ID del usuario
 * @param {string} accion - Acción realizada
 * @param {object} dataBefore - Datos anteriores (opcional)
 * @param {object} dataAfter - Datos posteriores (opcional)
 * @param {object} req - Request object para obtener IP y user agent (opcional)
 */
export async function audit(idExpediente, idUsuario, accion, dataBefore = null, dataAfter = null, req = null) {
  try {
    await pool.query(
      `INSERT INTO audit_expedientes 
       (id_expediente, id_usuario, accion, detalle, data_before, data_after, ip_address, user_agent) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        idExpediente,
        idUsuario,
        accion,
        JSON.stringify({ timestamp: new Date().toISOString() }),
        dataBefore ? JSON.stringify(dataBefore) : null,
        dataAfter ? JSON.stringify(dataAfter) : null,
        req ? (req.ip || req.connection?.remoteAddress) : null,
        req ? req.headers['user-agent'] : null
      ]
    );
  } catch (error) {
    console.error('Error registrando auditoría:', error);
    // No lanzar error para no bloquear la operación principal
  }
}

/**
 * Soft delete de expediente con todas sus relaciones
 * @param {number} idExpediente - ID del expediente
 * @param {number} deletedBy - ID del usuario que elimina
 */
export async function softDeleteExpediente(idExpediente, deletedBy) {
  return await transaction(async (connection) => {
    // 1. Soft delete del expediente
    await connection.query(
      'UPDATE expedientes SET deleted_at = NOW(), deleted_by = ? WHERE id_expediente = ?',
      [deletedBy, idExpediente]
    );

    // 2. Soft delete de consultas relacionadas
    await connection.query(
      'UPDATE consulta SET deleted_at = NOW(), deleted_by = ? WHERE id_expediente = ?',
      [deletedBy, idExpediente]
    );

    // 3. Soft delete de adjuntos relacionados
    await connection.query(
      'UPDATE adjuntos SET deleted_at = NOW(), deleted_by = ? WHERE id_expediente = ?',
      [deletedBy, idExpediente]
    );

    // 4. Registrar auditoría
    await connection.query(
      `INSERT INTO audit_expedientes (id_expediente, id_usuario, accion, detalle) 
       VALUES (?, ?, ?, ?)`,
      [
        idExpediente,
        deletedBy,
        'SOFT_DELETE_CASCADE',
        JSON.stringify({ 
          message: 'Expediente y registros relacionados eliminados',
          timestamp: new Date().toISOString()
        })
      ]
    );

    return true;
  });
}

// Exportar constantes de tablas para evitar typos
export const TABLES = {
  HISTORIA_CLINICA: 'historia_clinica',
  EXPEDIENTES: 'expedientes',
  CONSULTA: 'consulta',
  TRATAMIENTO: 'tratamiento',
  ADJUNTOS: 'adjuntos',
  CITAS: 'citas'
};

export const ID_COLUMNS = {
  HISTORIA_CLINICA: 'id_historiaClinica',
  EXPEDIENTES: 'id_expediente',
  CONSULTA: 'id_consulta',
  TRATAMIENTO: 'id_tratamiento',
  ADJUNTOS: 'id_adjunto',
  CITAS: 'id_cita'
};
