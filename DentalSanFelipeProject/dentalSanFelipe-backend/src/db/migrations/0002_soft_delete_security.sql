-- =====================================================
-- MIGRACIÓN 0002: SOFT DELETE Y MEJORAS DE SEGURIDAD
-- =====================================================
-- Fecha: 2025-12-11
-- Descripción: Implementa soft delete y mejoras de auditoría
-- =====================================================

USE dental_sanfelipe;

-- ==========================================
-- 1. AGREGAR SOFT DELETE A TABLAS CRÍTICAS
-- ==========================================

-- Historia Clínica - deleted_at
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
               WHERE TABLE_SCHEMA = 'dental_sanfelipe' 
               AND TABLE_NAME = 'historia_clinica' 
               AND COLUMN_NAME = 'deleted_at');
SET @sqlstmt := IF(@exist = 0, 
  'ALTER TABLE historia_clinica ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT "Soft delete - fecha de eliminación lógica"', 
  'SELECT "Column deleted_at already exists in historia_clinica" AS Info');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Historia Clínica - deleted_by
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
               WHERE TABLE_SCHEMA = 'dental_sanfelipe' 
               AND TABLE_NAME = 'historia_clinica' 
               AND COLUMN_NAME = 'deleted_by');
SET @sqlstmt := IF(@exist = 0, 
  'ALTER TABLE historia_clinica ADD COLUMN deleted_by INT NULL COMMENT "Usuario que realizó la eliminación"', 
  'SELECT "Column deleted_by already exists in historia_clinica" AS Info');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Expedientes - deleted_at
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
               WHERE TABLE_SCHEMA = 'dental_sanfelipe' 
               AND TABLE_NAME = 'expedientes' 
               AND COLUMN_NAME = 'deleted_at');
SET @sqlstmt := IF(@exist = 0, 
  'ALTER TABLE expedientes ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT "Soft delete - fecha de eliminación lógica"', 
  'SELECT "Column deleted_at already exists in expedientes" AS Info');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Expedientes - deleted_by
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
               WHERE TABLE_SCHEMA = 'dental_sanfelipe' 
               AND TABLE_NAME = 'expedientes' 
               AND COLUMN_NAME = 'deleted_by');
SET @sqlstmt := IF(@exist = 0, 
  'ALTER TABLE expedientes ADD COLUMN deleted_by INT NULL COMMENT "Usuario que realizó la eliminación"', 
  'SELECT "Column deleted_by already exists in expedientes" AS Info');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Consulta - deleted_at
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
               WHERE TABLE_SCHEMA = 'dental_sanfelipe' 
               AND TABLE_NAME = 'consulta' 
               AND COLUMN_NAME = 'deleted_at');
SET @sqlstmt := IF(@exist = 0, 
  'ALTER TABLE consulta ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT "Soft delete - fecha de eliminación lógica"', 
  'SELECT "Column deleted_at already exists in consulta" AS Info');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Consulta - deleted_by
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
               WHERE TABLE_SCHEMA = 'dental_sanfelipe' 
               AND TABLE_NAME = 'consulta' 
               AND COLUMN_NAME = 'deleted_by');
SET @sqlstmt := IF(@exist = 0, 
  'ALTER TABLE consulta ADD COLUMN deleted_by INT NULL COMMENT "Usuario que realizó la eliminación"', 
  'SELECT "Column deleted_by already exists in consulta" AS Info');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Tratamientos
ALTER TABLE tratamiento 
  ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete - fecha de eliminación lógica',
  ADD COLUMN deleted_by INT NULL COMMENT 'Usuario que realizó la eliminación',
  ADD CONSTRAINT fk_tratamiento_deleted_by FOREIGN KEY (deleted_by) REFERENCES usuarios(id_usuario) ON DELETE SET NULL;

-- Adjuntos
ALTER TABLE adjuntos 
  ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete - fecha de eliminación lógica',
  ADD COLUMN deleted_by INT NULL COMMENT 'Usuario que realizó la eliminación',
  ADD CONSTRAINT fk_adjuntos_deleted_by FOREIGN KEY (deleted_by) REFERENCES usuarios(id_usuario) ON DELETE SET NULL;

-- Citas (importante para historial)
ALTER TABLE citas 
  ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete - fecha de eliminación lógica',
  ADD COLUMN deleted_by INT NULL COMMENT 'Usuario que realizó la eliminación',
  ADD CONSTRAINT fk_citas_deleted_by FOREIGN KEY (deleted_by) REFERENCES usuarios(id_usuario) ON DELETE SET NULL;

-- ==========================================
-- 2. MEJORAR TABLA DE ADJUNTOS
-- ==========================================

-- Agregar campos de metadata faltantes
ALTER TABLE adjuntos 
  ADD COLUMN tamano_bytes BIGINT NULL COMMENT 'Tamaño del archivo en bytes',
  ADD COLUMN thumbnail_path VARCHAR(512) NULL COMMENT 'Ruta del thumbnail/preview si existe',
  ADD COLUMN mime_type VARCHAR(100) NULL COMMENT 'MIME type del archivo (image/jpeg, application/pdf, etc.)';

-- ==========================================
-- 3. MEJORAR AUDITORÍA
-- ==========================================

-- Agregar columnas para before/after en audit_expedientes
ALTER TABLE audit_expedientes 
  ADD COLUMN data_before JSON NULL COMMENT 'Estado anterior de los datos (JSON)',
  ADD COLUMN data_after JSON NULL COMMENT 'Estado posterior de los datos (JSON)',
  ADD COLUMN ip_address VARCHAR(45) NULL COMMENT 'Dirección IP del usuario',
  ADD COLUMN user_agent TEXT NULL COMMENT 'User agent del navegador';

-- ==========================================
-- 4. MEJORAR TABLA DE CITAS
-- ==========================================

-- Combinar fecha_cita y hora_cita en un solo campo
-- Primero, crear nueva columna
ALTER TABLE citas 
  ADD COLUMN fecha_hora_cita DATETIME NULL COMMENT 'Fecha y hora de la cita combinadas' AFTER id_usuario;

-- Migrar datos existentes (combinar fecha_cita + hora_cita)
UPDATE citas 
SET fecha_hora_cita = TIMESTAMP(fecha_cita, TIME(hora_cita))
WHERE fecha_cita IS NOT NULL AND hora_cita IS NOT NULL;

-- Nota: NO eliminamos fecha_cita y hora_cita aún para mantener compatibilidad
-- Se pueden eliminar en una migración futura después de actualizar el código

-- ==========================================
-- 5. ÍNDICES PARA SOFT DELETE
-- ==========================================

-- Índices para optimizar queries con deleted_at
CREATE INDEX idx_historia_deleted ON historia_clinica(deleted_at);
CREATE INDEX idx_expedientes_deleted ON expedientes(deleted_at);
CREATE INDEX idx_consulta_deleted ON consulta(deleted_at);
CREATE INDEX idx_tratamiento_deleted ON tratamiento(deleted_at);
CREATE INDEX idx_adjuntos_deleted ON adjuntos(deleted_at);
CREATE INDEX idx_citas_deleted ON citas(deleted_at);

-- Índice compuesto para citas activas por fecha
CREATE INDEX idx_citas_activas_fecha ON citas(deleted_at, fecha_hora_cita);

-- ==========================================
-- 6. CREAR VISTA PARA REGISTROS ACTIVOS
-- ==========================================

-- Vista de expedientes activos
CREATE OR REPLACE VIEW v_expedientes_activos AS
SELECT * FROM expedientes WHERE deleted_at IS NULL;

-- Vista de consultas activas
CREATE OR REPLACE VIEW v_consultas_activas AS
SELECT * FROM consulta WHERE deleted_at IS NULL;

-- Vista de citas activas
CREATE OR REPLACE VIEW v_citas_activas AS
SELECT * FROM citas WHERE deleted_at IS NULL;

-- Vista de tratamientos activos
CREATE OR REPLACE VIEW v_tratamientos_activos AS
SELECT * FROM tratamiento WHERE deleted_at IS NULL;

-- ==========================================
-- 7. FUNCIÓN HELPER PARA SOFT DELETE
-- ==========================================

DELIMITER //

-- Procedimiento para soft delete de expedientes
CREATE PROCEDURE sp_soft_delete_expediente(
  IN p_id_expediente INT,
  IN p_deleted_by INT
)
BEGIN
  UPDATE expedientes 
  SET deleted_at = NOW(), 
      deleted_by = p_deleted_by 
  WHERE id_expediente = p_id_expediente 
    AND deleted_at IS NULL;
    
  -- Registrar en auditoría
  INSERT INTO audit_expedientes (id_expediente, id_usuario, accion, detalle)
  VALUES (p_id_expediente, p_deleted_by, 'SOFT_DELETE', 
          JSON_OBJECT('fecha_eliminacion', NOW()));
END //

-- Procedimiento para restaurar expediente
CREATE PROCEDURE sp_restore_expediente(
  IN p_id_expediente INT,
  IN p_restored_by INT
)
BEGIN
  UPDATE expedientes 
  SET deleted_at = NULL, 
      deleted_by = NULL 
  WHERE id_expediente = p_id_expediente 
    AND deleted_at IS NOT NULL;
    
  -- Registrar en auditoría
  INSERT INTO audit_expedientes (id_expediente, id_usuario, accion, detalle)
  VALUES (p_id_expediente, p_restored_by, 'RESTORE', 
          JSON_OBJECT('fecha_restauracion', NOW()));
END //

DELIMITER ;

-- ==========================================
-- 8. VERIFICACIÓN Y RESUMEN
-- ==========================================

SELECT '✅ Soft delete implementado en:' as status;
SELECT 
  TABLE_NAME, 
  COLUMN_NAME 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'dental_sanfelipe' 
  AND COLUMN_NAME = 'deleted_at';

SELECT '✅ Campos de auditoría mejorados' as status;
SELECT 
  COLUMN_NAME,
  COLUMN_TYPE,
  COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'dental_sanfelipe' 
  AND TABLE_NAME = 'audit_expedientes'
  AND COLUMN_NAME IN ('data_before', 'data_after', 'ip_address');

SELECT '✅ Metadata de adjuntos agregada' as status;
SELECT 
  COLUMN_NAME,
  COLUMN_TYPE
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'dental_sanfelipe' 
  AND TABLE_NAME = 'adjuntos'
  AND COLUMN_NAME IN ('tamano_bytes', 'thumbnail_path', 'mime_type');

SELECT '✅ Migración 0002 completada exitosamente' as resultado;
SELECT NOW() as fecha_migracion;
