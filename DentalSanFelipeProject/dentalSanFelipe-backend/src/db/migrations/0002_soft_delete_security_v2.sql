-- =====================================================
-- MIGRACIÓN 0002: SOFT DELETE Y MEJORAS DE SEGURIDAD
-- =====================================================
-- Versión IDEMPOTENTE (se puede ejecutar múltiples veces)
-- Fecha: 2025-12-11
-- =====================================================

USE dental_sanfelipe;

-- ==========================================
-- 1. AGREGAR SOFT DELETE - TRATAMIENTO
-- ==========================================

-- Tratamiento - deleted_at
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'dental_sanfelipe' AND TABLE_NAME = 'tratamiento' AND COLUMN_NAME = 'deleted_at');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE tratamiento ADD COLUMN deleted_at TIMESTAMP NULL', 'SELECT "deleted_at exists" AS Info');
PREPARE stmt FROM @sqlstmt; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Tratamiento - deleted_by
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'dental_sanfelipe' AND TABLE_NAME = 'tratamiento' AND COLUMN_NAME = 'deleted_by');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE tratamiento ADD COLUMN deleted_by INT NULL', 'SELECT "deleted_by exists" AS Info');
PREPARE stmt FROM @sqlstmt; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ==========================================
-- 2. AGREGAR SOFT DELETE - HISTORIA CLINICA
-- ==========================================

-- Historia - deleted_at
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'dental_sanfelipe' AND TABLE_NAME = 'historia_clinica' AND COLUMN_NAME = 'deleted_at');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE historia_clinica ADD COLUMN deleted_at TIMESTAMP NULL', 'SELECT "deleted_at exists" AS Info');
PREPARE stmt FROM @sqlstmt; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Historia - deleted_by
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'dental_sanfelipe' AND TABLE_NAME = 'historia_clinica' AND COLUMN_NAME = 'deleted_by');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE historia_clinica ADD COLUMN deleted_by INT NULL', 'SELECT "deleted_by exists" AS Info');
PREPARE stmt FROM @sqlstmt; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ==========================================
-- 3. AGREGAR SOFT DELETE - EXPEDIENTES
-- ==========================================

-- Expedientes - deleted_at
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'dental_sanfelipe' AND TABLE_NAME = 'expedientes' AND COLUMN_NAME = 'deleted_at');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE expedientes ADD COLUMN deleted_at TIMESTAMP NULL', 'SELECT "deleted_at exists" AS Info');
PREPARE stmt FROM @sqlstmt; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Expedientes - deleted_by
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'dental_sanfelipe' AND TABLE_NAME = 'expedientes' AND COLUMN_NAME = 'deleted_by');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE expedientes ADD COLUMN deleted_by INT NULL', 'SELECT "deleted_by exists" AS Info');
PREPARE stmt FROM @sqlstmt; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ==========================================
-- 4. AGREGAR SOFT DELETE - CONSULTA
-- ==========================================

-- Consulta - deleted_at
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'dental_sanfelipe' AND TABLE_NAME = 'consulta' AND COLUMN_NAME = 'deleted_at');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE consulta ADD COLUMN deleted_at TIMESTAMP NULL', 'SELECT "deleted_at exists" AS Info');
PREPARE stmt FROM @sqlstmt; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Consulta - deleted_by
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'dental_sanfelipe' AND TABLE_NAME = 'consulta' AND COLUMN_NAME = 'deleted_by');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE consulta ADD COLUMN deleted_by INT NULL', 'SELECT "deleted_by exists" AS Info');
PREPARE stmt FROM @sqlstmt; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ==========================================
-- 5. AGREGAR SOFT DELETE - ADJUNTOS
-- ==========================================

-- Adjuntos - deleted_at
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'dental_sanfelipe' AND TABLE_NAME = 'adjuntos' AND COLUMN_NAME = 'deleted_at');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE adjuntos ADD COLUMN deleted_at TIMESTAMP NULL', 'SELECT "deleted_at exists" AS Info');
PREPARE stmt FROM @sqlstmt; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Adjuntos - deleted_by
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'dental_sanfelipe' AND TABLE_NAME = 'adjuntos' AND COLUMN_NAME = 'deleted_by');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE adjuntos ADD COLUMN deleted_by INT NULL', 'SELECT "deleted_by exists" AS Info');
PREPARE stmt FROM @sqlstmt; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ==========================================
-- 6. AGREGAR SOFT DELETE - CITAS
-- ==========================================

-- Citas - deleted_at
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'dental_sanfelipe' AND TABLE_NAME = 'citas' AND COLUMN_NAME = 'deleted_at');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE citas ADD COLUMN deleted_at TIMESTAMP NULL', 'SELECT "deleted_at exists" AS Info');
PREPARE stmt FROM @sqlstmt; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Citas - deleted_by
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'dental_sanfelipe' AND TABLE_NAME = 'citas' AND COLUMN_NAME = 'deleted_by');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE citas ADD COLUMN deleted_by INT NULL', 'SELECT "deleted_by exists" AS Info');
PREPARE stmt FROM @sqlstmt; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ==========================================
-- 7. MEJORAR TABLA ADJUNTOS - METADATA
-- ==========================================

-- tamano_bytes
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'dental_sanfelipe' AND TABLE_NAME = 'adjuntos' AND COLUMN_NAME = 'tamano_bytes');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE adjuntos ADD COLUMN tamano_bytes BIGINT NULL', 'SELECT "tamano_bytes exists" AS Info');
PREPARE stmt FROM @sqlstmt; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- thumbnail_path
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'dental_sanfelipe' AND TABLE_NAME = 'adjuntos' AND COLUMN_NAME = 'thumbnail_path');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE adjuntos ADD COLUMN thumbnail_path VARCHAR(512) NULL', 'SELECT "thumbnail_path exists" AS Info');
PREPARE stmt FROM @sqlstmt; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- mime_type
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'dental_sanfelipe' AND TABLE_NAME = 'adjuntos' AND COLUMN_NAME = 'mime_type');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE adjuntos ADD COLUMN mime_type VARCHAR(100) NULL', 'SELECT "mime_type exists" AS Info');
PREPARE stmt FROM @sqlstmt; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ==========================================
-- 8. MEJORAR AUDITORÍA
-- ==========================================

-- data_before
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'dental_sanfelipe' AND TABLE_NAME = 'audit_expedientes' AND COLUMN_NAME = 'data_before');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE audit_expedientes ADD COLUMN data_before JSON NULL', 'SELECT "data_before exists" AS Info');
PREPARE stmt FROM @sqlstmt; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- data_after
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'dental_sanfelipe' AND TABLE_NAME = 'audit_expedientes' AND COLUMN_NAME = 'data_after');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE audit_expedientes ADD COLUMN data_after JSON NULL', 'SELECT "data_after exists" AS Info');
PREPARE stmt FROM @sqlstmt; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ip_address
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'dental_sanfelipe' AND TABLE_NAME = 'audit_expedientes' AND COLUMN_NAME = 'ip_address');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE audit_expedientes ADD COLUMN ip_address VARCHAR(45) NULL', 'SELECT "ip_address exists" AS Info');
PREPARE stmt FROM @sqlstmt; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- user_agent
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'dental_sanfelipe' AND TABLE_NAME = 'audit_expedientes' AND COLUMN_NAME = 'user_agent');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE audit_expedientes ADD COLUMN user_agent TEXT NULL', 'SELECT "user_agent exists" AS Info');
PREPARE stmt FROM @sqlstmt; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ==========================================
-- 9. MEJORAR CITAS - FECHA/HORA COMBINADA
-- ==========================================

-- fecha_hora_cita
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'dental_sanfelipe' AND TABLE_NAME = 'citas' AND COLUMN_NAME = 'fecha_hora_cita');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE citas ADD COLUMN fecha_hora_cita DATETIME NULL AFTER hora_cita', 'SELECT "fecha_hora_cita exists" AS Info');
PREPARE stmt FROM @sqlstmt; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Migrar datos existentes (combinar fecha_cita + hora_cita)
UPDATE citas 
SET fecha_hora_cita = TIMESTAMP(fecha_cita, TIME(hora_cita))
WHERE fecha_hora_cita IS NULL AND fecha_cita IS NOT NULL AND hora_cita IS NOT NULL;

-- ==========================================
-- 10. ÍNDICES PARA SOFT DELETE
-- ==========================================

-- Índices si no existen
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = 'dental_sanfelipe' AND TABLE_NAME = 'historia_clinica' AND INDEX_NAME = 'idx_historia_deleted');
SET @sqlstmt := IF(@exist = 0, 'CREATE INDEX idx_historia_deleted ON historia_clinica(deleted_at)', 'SELECT "idx_historia_deleted exists" AS Info');
PREPARE stmt FROM @sqlstmt; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = 'dental_sanfelipe' AND TABLE_NAME = 'expedientes' AND INDEX_NAME = 'idx_expedientes_deleted');
SET @sqlstmt := IF(@exist = 0, 'CREATE INDEX idx_expedientes_deleted ON expedientes(deleted_at)', 'SELECT "idx_expedientes_deleted exists" AS Info');
PREPARE stmt FROM @sqlstmt; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = 'dental_sanfelipe' AND TABLE_NAME = 'consulta' AND INDEX_NAME = 'idx_consulta_deleted');
SET @sqlstmt := IF(@exist = 0, 'CREATE INDEX idx_consulta_deleted ON consulta(deleted_at)', 'SELECT "idx_consulta_deleted exists" AS Info');
PREPARE stmt FROM @sqlstmt; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = 'dental_sanfelipe' AND TABLE_NAME = 'tratamiento' AND INDEX_NAME = 'idx_tratamiento_deleted');
SET @sqlstmt := IF(@exist = 0, 'CREATE INDEX idx_tratamiento_deleted ON tratamiento(deleted_at)', 'SELECT "idx_tratamiento_deleted exists" AS Info');
PREPARE stmt FROM @sqlstmt; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = 'dental_sanfelipe' AND TABLE_NAME = 'adjuntos' AND INDEX_NAME = 'idx_adjuntos_deleted');
SET @sqlstmt := IF(@exist = 0, 'CREATE INDEX idx_adjuntos_deleted ON adjuntos(deleted_at)', 'SELECT "idx_adjuntos_deleted exists" AS Info');
PREPARE stmt FROM @sqlstmt; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = 'dental_sanfelipe' AND TABLE_NAME = 'citas' AND INDEX_NAME = 'idx_citas_deleted');
SET @sqlstmt := IF(@exist = 0, 'CREATE INDEX idx_citas_deleted ON citas(deleted_at)', 'SELECT "idx_citas_deleted exists" AS Info');
PREPARE stmt FROM @sqlstmt; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ==========================================
-- 11. RESUMEN FINAL
-- ==========================================

SELECT '✅ Migración 0002 completada' as resultado;
SELECT NOW() as fecha_migracion;

-- Mostrar columnas agregadas
SELECT 
  'Soft Delete' as categoria,
  TABLE_NAME as tabla,
  COUNT(*) as columnas_agregadas
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'dental_sanfelipe' 
  AND COLUMN_NAME IN ('deleted_at', 'deleted_by')
GROUP BY TABLE_NAME;

SELECT 
  'Auditoría' as categoria,
  COUNT(*) as columnas_mejoradas
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'dental_sanfelipe' 
  AND TABLE_NAME = 'audit_expedientes'
  AND COLUMN_NAME IN ('data_before', 'data_after', 'ip_address', 'user_agent');

SELECT 
  'Adjuntos Metadata' as categoria,
  COUNT(*) as columnas_agregadas
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'dental_sanfelipe' 
  AND TABLE_NAME = 'adjuntos'
  AND COLUMN_NAME IN ('tamano_bytes', 'thumbnail_path', 'mime_type');
