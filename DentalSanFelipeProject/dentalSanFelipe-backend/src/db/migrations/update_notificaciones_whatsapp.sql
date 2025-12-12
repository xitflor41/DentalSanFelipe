-- Migración: Actualizar tabla notificaciones para WhatsApp
-- Fecha: 2024
-- Descripción: Ajustar campos específicos para notificaciones de WhatsApp

USE dental_sanfelipe;

-- 1. Agregar columna de teléfono si no existe
ALTER TABLE notificaciones 
  ADD COLUMN IF NOT EXISTS telefono VARCHAR(30) NOT NULL DEFAULT '' 
  COMMENT 'Número de WhatsApp del paciente' 
  AFTER id_cita;

-- 2. Modificar columna mensaje para permitir más texto
ALTER TABLE notificaciones 
  MODIFY COLUMN mensaje TEXT NOT NULL 
  COMMENT 'Mensaje de recordatorio a enviar por WhatsApp';

-- 3. Renombrar columna provider_msg_id a whatsapp_msg_id
ALTER TABLE notificaciones 
  CHANGE COLUMN provider_msg_id whatsapp_msg_id VARCHAR(255) NULL 
  COMMENT 'ID del mensaje de WhatsApp';

-- 4. Agregar índices para mejorar rendimiento
ALTER TABLE notificaciones 
  ADD INDEX IF NOT EXISTS idx_enviado (enviado);

ALTER TABLE notificaciones 
  ADD INDEX IF NOT EXISTS idx_fecha_programada (fecha_programada);

-- 5. Actualizar comentario de la tabla
ALTER TABLE notificaciones 
  COMMENT = 'Notificaciones de WhatsApp para recordatorios de citas';

-- 6. Poblar teléfono desde pacientes para notificaciones existentes
UPDATE notificaciones n
JOIN citas c ON n.id_cita = c.id_cita
JOIN pacientes p ON c.id_paciente = p.id_paciente
SET n.telefono = p.telefono
WHERE n.telefono = '' OR n.telefono IS NULL;

SELECT 'Migración completada: tabla notificaciones actualizada para WhatsApp' AS status;
