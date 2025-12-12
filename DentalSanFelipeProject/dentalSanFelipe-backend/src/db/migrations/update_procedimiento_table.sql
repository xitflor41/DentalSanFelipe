-- Migración: Actualizar tabla procedimiento con nuevos campos
-- Fecha: 2024
-- Descripción: Agregar campos categoria, duracion_estimada, activo y renombrar columnas

-- Verificar si ya existe la columna 'nombre', si no, renombrar nombreProcedimiento
ALTER TABLE procedimiento 
  CHANGE COLUMN nombreProcedimiento nombre VARCHAR(150) NOT NULL;

-- Renombrar 'costo' a 'costo_base' si no existe
ALTER TABLE procedimiento 
  CHANGE COLUMN costo costo_base DECIMAL(10,2) DEFAULT NULL;

-- Agregar nuevas columnas si no existen
ALTER TABLE procedimiento 
  ADD COLUMN IF NOT EXISTS categoria VARCHAR(100) COMMENT 'Ej: Endodoncia, Ortodoncia, Cirugía, Limpieza, Restauración, etc.' AFTER descripcion;

ALTER TABLE procedimiento 
  ADD COLUMN IF NOT EXISTS duracion_estimada INT COMMENT 'Duración estimada en minutos' AFTER costo_base;

ALTER TABLE procedimiento 
  ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT TRUE AFTER duracion_estimada;

ALTER TABLE procedimiento 
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;

-- Actualizar registros existentes para marcarlos como activos
UPDATE procedimiento SET activo = TRUE WHERE activo IS NULL;

SELECT 'Migración completada: tabla procedimiento actualizada' AS status;
