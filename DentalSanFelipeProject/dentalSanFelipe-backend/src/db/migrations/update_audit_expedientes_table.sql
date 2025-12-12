-- Migración: Actualizar tabla audit_expedientes
-- Fecha: 2024
-- Descripción: Cambiar ENUM a VARCHAR para permitir más tipos de acciones

USE dental_sanfelipe;

-- 1. Modificar columna accion de ENUM a VARCHAR
ALTER TABLE audit_expedientes 
  MODIFY COLUMN accion VARCHAR(100) NOT NULL;

-- 2. Modificar columna detalle de JSON a TEXT (más compatible)
ALTER TABLE audit_expedientes 
  MODIFY COLUMN detalle TEXT NULL;

-- 3. Permitir id_expediente NULL (para logs generales)
ALTER TABLE audit_expedientes 
  MODIFY COLUMN id_expediente INT NULL;

-- 4. Agregar índices para mejor rendimiento
ALTER TABLE audit_expedientes 
  ADD INDEX IF NOT EXISTS idx_expediente (id_expediente);

ALTER TABLE audit_expedientes 
  ADD INDEX IF NOT EXISTS idx_fecha (fecha);

ALTER TABLE audit_expedientes 
  ADD INDEX IF NOT EXISTS idx_usuario (id_usuario);

-- 5. Agregar comentario a la tabla
ALTER TABLE audit_expedientes 
  COMMENT = 'Registro de auditoría de todas las operaciones en expedientes';

SELECT 'Migración completada: tabla audit_expedientes actualizada' AS status;
