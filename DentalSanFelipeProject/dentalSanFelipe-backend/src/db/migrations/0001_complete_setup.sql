-- ==========================================
-- MIGRACIÓN: Preparar base de datos para sistema completo
-- ==========================================
-- Ejecutar este script después de inicializar la base de datos

USE dental_sanfelipe;

-- ==========================================
-- 1. ACTUALIZAR TABLA NOTIFICACIONES PARA WHATSAPP
-- ==========================================

-- Agregar columna telefono si no existe
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
               WHERE TABLE_SCHEMA = 'dental_sanfelipe' 
               AND TABLE_NAME = 'notificaciones' 
               AND COLUMN_NAME = 'telefono');
SET @sqlstmt := IF(@exist = 0, 
  'ALTER TABLE notificaciones ADD COLUMN telefono VARCHAR(30) COMMENT "Número de teléfono del destinatario (formato: +52XXXXXXXXXX)"', 
  'SELECT "Column telefono already exists" AS Info');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Modificar columna mensaje a TEXT
ALTER TABLE notificaciones 
  MODIFY COLUMN mensaje TEXT NOT NULL COMMENT 'Contenido del mensaje de WhatsApp';

-- Renombrar provider_msg_id a whatsapp_msg_id si existe
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
               WHERE TABLE_SCHEMA = 'dental_sanfelipe' 
               AND TABLE_NAME = 'notificaciones' 
               AND COLUMN_NAME = 'provider_msg_id');
SET @sqlstmt := IF(@exist > 0, 
  'ALTER TABLE notificaciones CHANGE COLUMN provider_msg_id whatsapp_msg_id VARCHAR(100) COMMENT "ID del mensaje en WhatsApp (Twilio SID o Meta WAMID)"', 
  'SELECT "Column provider_msg_id does not exist" AS Info');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Agregar whatsapp_msg_id si no existe (en caso de que no existiera provider_msg_id)
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
               WHERE TABLE_SCHEMA = 'dental_sanfelipe' 
               AND TABLE_NAME = 'notificaciones' 
               AND COLUMN_NAME = 'whatsapp_msg_id');
SET @sqlstmt := IF(@exist = 0, 
  'ALTER TABLE notificaciones ADD COLUMN whatsapp_msg_id VARCHAR(100) COMMENT "ID del mensaje en WhatsApp (Twilio SID o Meta WAMID)"', 
  'SELECT "Column whatsapp_msg_id already exists" AS Info');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Agregar índice en enviado si no existe
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
               WHERE TABLE_SCHEMA = 'dental_sanfelipe' 
               AND TABLE_NAME = 'notificaciones' 
               AND INDEX_NAME = 'idx_enviado');
SET @sqlstmt := IF(@exist = 0, 
  'ALTER TABLE notificaciones ADD INDEX idx_enviado (enviado)', 
  'SELECT "Index idx_enviado already exists" AS Info');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Agregar índice en fecha_programada si no existe
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
               WHERE TABLE_SCHEMA = 'dental_sanfelipe' 
               AND TABLE_NAME = 'notificaciones' 
               AND INDEX_NAME = 'idx_fecha_programada');
SET @sqlstmt := IF(@exist = 0, 
  'ALTER TABLE notificaciones ADD INDEX idx_fecha_programada (fecha_programada)', 
  'SELECT "Index idx_fecha_programada already exists" AS Info');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Poblar telefono desde pacientes para registros existentes
UPDATE notificaciones n
INNER JOIN citas a ON n.id_cita = a.id_cita
INNER JOIN pacientes p ON a.id_paciente = p.id_paciente
SET n.telefono = p.telefono
WHERE n.telefono IS NULL AND p.telefono IS NOT NULL;

-- ==========================================
-- 2. ACTUALIZAR TABLA AUDIT_EXPEDIENTES
-- ==========================================

-- Cambiar tipo de dato de accion de ENUM a VARCHAR para mayor flexibilidad
ALTER TABLE audit_expedientes 
  MODIFY COLUMN accion VARCHAR(100) NOT NULL 
  COMMENT 'Acción realizada: CREAR, MODIFICAR, ELIMINAR, etc.';

-- Cambiar detalle a TEXT para permitir más información
ALTER TABLE audit_expedientes 
  MODIFY COLUMN detalle TEXT 
  COMMENT 'Detalles de la modificación en formato JSON o texto';

-- Hacer id_expediente nullable para logs no relacionados a un expediente específico
ALTER TABLE audit_expedientes 
  MODIFY COLUMN id_expediente INT NULL 
  COMMENT 'ID del expediente afectado (NULL para operaciones generales)';

-- Agregar índice en audit_expedientes.id_usuario
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
               WHERE TABLE_SCHEMA = 'dental_sanfelipe' 
               AND TABLE_NAME = 'audit_expedientes' 
               AND INDEX_NAME = 'idx_id_usuario');
SET @sqlstmt := IF(@exist = 0, 
  'ALTER TABLE audit_expedientes ADD INDEX idx_id_usuario (id_usuario)', 
  'SELECT "Index idx_id_usuario already exists" AS Info');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Agregar índice en audit_expedientes.fecha
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
               WHERE TABLE_SCHEMA = 'dental_sanfelipe' 
               AND TABLE_NAME = 'audit_expedientes' 
               AND INDEX_NAME = 'idx_fecha');
SET @sqlstmt := IF(@exist = 0, 
  'ALTER TABLE audit_expedientes ADD INDEX idx_fecha (fecha)', 
  'SELECT "Index idx_fecha already exists" AS Info');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Agregar índice en audit_expedientes.accion
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
               WHERE TABLE_SCHEMA = 'dental_sanfelipe' 
               AND TABLE_NAME = 'audit_expedientes' 
               AND INDEX_NAME = 'idx_accion');
SET @sqlstmt := IF(@exist = 0, 
  'ALTER TABLE audit_expedientes ADD INDEX idx_accion (accion)', 
  'SELECT "Index idx_accion already exists" AS Info');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ==========================================
-- 3. ACTUALIZAR TABLA ADJUNTOS
-- ==========================================

-- Agregar columna creado_por si no existe
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
               WHERE TABLE_SCHEMA = 'dental_sanfelipe' 
               AND TABLE_NAME = 'adjuntos' 
               AND COLUMN_NAME = 'creado_por');
SET @sqlstmt := IF(@exist = 0, 
  'ALTER TABLE adjuntos ADD COLUMN creado_por INT NULL COMMENT "ID del usuario que subió el archivo"', 
  'SELECT "Column creado_por already exists" AS Info');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Agregar FK a usuarios si no existe
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
               WHERE TABLE_SCHEMA = 'dental_sanfelipe' 
               AND TABLE_NAME = 'adjuntos' 
               AND CONSTRAINT_NAME = 'fk_adjuntos_usuario');
SET @sqlstmt := IF(@exist = 0, 
  'ALTER TABLE adjuntos ADD CONSTRAINT fk_adjuntos_usuario FOREIGN KEY (creado_por) REFERENCES usuarios(id_usuario) ON DELETE SET NULL ON UPDATE CASCADE', 
  'SELECT "FK fk_adjuntos_usuario already exists" AS Info');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ==========================================
-- 4. VERIFICAR ÍNDICES IMPORTANTES
-- ==========================================

-- Índice en pacientes.nombre
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
               WHERE TABLE_SCHEMA = 'dental_sanfelipe' 
               AND TABLE_NAME = 'pacientes' 
               AND INDEX_NAME = 'idx_nombre');
SET @sqlstmt := IF(@exist = 0, 
  'ALTER TABLE pacientes ADD INDEX idx_nombre (nombre, apellido)', 
  'SELECT "Index idx_nombre already exists" AS Info');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Índice en pacientes.telefono
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
               WHERE TABLE_SCHEMA = 'dental_sanfelipe' 
               AND TABLE_NAME = 'pacientes' 
               AND INDEX_NAME = 'idx_telefono');
SET @sqlstmt := IF(@exist = 0, 
  'ALTER TABLE pacientes ADD INDEX idx_telefono (telefono)', 
  'SELECT "Index idx_telefono already exists" AS Info');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Índice en citas.fecha_cita
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
               WHERE TABLE_SCHEMA = 'dental_sanfelipe' 
               AND TABLE_NAME = 'citas' 
               AND INDEX_NAME = 'idx_fecha_cita');
SET @sqlstmt := IF(@exist = 0, 
  'ALTER TABLE citas ADD INDEX idx_fecha_cita (fecha_cita)', 
  'SELECT "Index idx_fecha_cita already exists" AS Info');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Índice en citas.id_paciente
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
               WHERE TABLE_SCHEMA = 'dental_sanfelipe' 
               AND TABLE_NAME = 'citas' 
               AND INDEX_NAME = 'idx_id_paciente');
SET @sqlstmt := IF(@exist = 0, 
  'ALTER TABLE citas ADD INDEX idx_id_paciente (id_paciente)', 
  'SELECT "Index idx_id_paciente already exists" AS Info');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Índice en citas.estado
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
               WHERE TABLE_SCHEMA = 'dental_sanfelipe' 
               AND TABLE_NAME = 'citas' 
               AND INDEX_NAME = 'idx_estado');
SET @sqlstmt := IF(@exist = 0, 
  'ALTER TABLE citas ADD INDEX idx_estado (estado)', 
  'SELECT "Index idx_estado already exists" AS Info');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Índice en expedientes.id_paciente
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
               WHERE TABLE_SCHEMA = 'dental_sanfelipe' 
               AND TABLE_NAME = 'expedientes' 
               AND INDEX_NAME = 'idx_id_paciente');
SET @sqlstmt := IF(@exist = 0, 
  'ALTER TABLE expedientes ADD INDEX idx_id_paciente (id_paciente)', 
  'SELECT "Index idx_id_paciente already exists" AS Info');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Índice en expedientes.numero_expediente
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
               WHERE TABLE_SCHEMA = 'dental_sanfelipe' 
               AND TABLE_NAME = 'expedientes' 
               AND INDEX_NAME = 'idx_numero_expediente');
SET @sqlstmt := IF(@exist = 0, 
  'ALTER TABLE expedientes ADD INDEX idx_numero_expediente (numero_expediente)', 
  'SELECT "Index idx_numero_expediente already exists" AS Info');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ==========================================
-- 5. CREAR USUARIO ADMINISTRADOR INICIAL (SI NO EXISTE)
-- ==========================================

-- Verificar si ya existe un administrador
SELECT COUNT(*) as admin_count 
FROM usuarios 
WHERE rol = 'administrador';

-- Si no existe, crear uno (contraseña: Admin123!)
-- Hash bcrypt de "Admin123!": $2b$10$rN5ZYH.EHmV0mJZX3ZjxH.Lq6vVqYxvZkfJYxVjU5mXv4YvYZjxZm
INSERT INTO usuarios (nombre, apellido, username, correo, contrasenna, rol, activo)
SELECT 
  'Super',
  'Administrador',
  'admin',
  'admin@dentalsanfelipe.com',
  '$2b$10$rN5ZYH.EHmV0mJZX3ZjxH.Lq6vVqYxvZkfJYxVjU5mXv4YvYZjxZm',
  'administrador',
  TRUE
WHERE NOT EXISTS (
  SELECT 1 FROM usuarios WHERE username = 'admin' OR rol = 'administrador'
);

-- ==========================================
-- 6. CREAR PROCEDIMIENTOS DE EJEMPLO (SI LA TABLA ESTÁ VACÍA)
-- ==========================================

INSERT INTO procedimiento (nombre, descripcion, categoria, costo_base, duracion_estimada, activo)
SELECT * FROM (
  SELECT 'Limpieza Dental' as nombre, 'Profilaxis dental profesional' as descripcion, 
         'Preventiva' as categoria, 500.00 as costo_base, 30 as duracion_estimada, TRUE as activo
  UNION ALL
  SELECT 'Extracción Simple', 'Extracción de pieza dental sin complicaciones', 
         'Cirugía', 800.00, 45, TRUE
  UNION ALL
  SELECT 'Endodoncia', 'Tratamiento de conductos', 
         'Endodoncia', 2500.00, 90, TRUE
  UNION ALL
  SELECT 'Resina Dental', 'Restauración con resina compuesta', 
         'Restauración', 600.00, 60, TRUE
  UNION ALL
  SELECT 'Corona Dental', 'Colocación de corona de porcelana', 
         'Prótesis', 4500.00, 120, TRUE
  UNION ALL
  SELECT 'Ortodoncia (Mensual)', 'Pago mensual de tratamiento ortodóntico', 
         'Ortodoncia', 800.00, 30, TRUE
  UNION ALL
  SELECT 'Blanqueamiento', 'Blanqueamiento dental en consultorio', 
         'Estética', 1500.00, 60, TRUE
) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM procedimiento WHERE nombre = tmp.nombre
);

-- ==========================================
-- 7. VERIFICAR INTEGRIDAD DE DATOS
-- ==========================================

-- Verificar que todos los citas tengan id_paciente válido
SELECT 
  'ADVERTENCIA: Citas con pacientes inexistentes' as tipo,
  COUNT(*) as cantidad
FROM citas a
LEFT JOIN pacientes p ON a.id_paciente = p.id_paciente
WHERE p.id_paciente IS NULL;

-- Verificar que todos los expedientes tengan paciente válido
SELECT 
  'ADVERTENCIA: Expedientes con pacientes inexistentes' as tipo,
  COUNT(*) as cantidad
FROM expedientes e
LEFT JOIN pacientes p ON e.id_paciente = p.id_paciente
WHERE p.id_paciente IS NULL;

-- Verificar que todos los tratamientos tengan procedimiento válido
SELECT 
  'ADVERTENCIA: Tratamientos con procedimientos inexistentes' as tipo,
  COUNT(*) as cantidad
FROM tratamiento t
LEFT JOIN procedimiento p ON t.id_procedimiento = p.id_procedimiento
WHERE p.id_procedimiento IS NULL;

-- ==========================================
-- 8. ESTADÍSTICAS FINALES
-- ==========================================

SELECT 'RESUMEN DEL SISTEMA' as '===================';

SELECT 
  'Usuarios' as tabla,
  COUNT(*) as total,
  SUM(CASE WHEN rol = 'administrador' THEN 1 ELSE 0 END) as administradores,
  SUM(CASE WHEN rol = 'odontologo' THEN 1 ELSE 0 END) as odontologos,
  SUM(CASE WHEN rol = 'auxiliar' THEN 1 ELSE 0 END) as auxiliares
FROM usuarios

UNION ALL

SELECT 
  'Pacientes',
  COUNT(*),
  NULL,
  NULL,
  NULL
FROM pacientes

UNION ALL

SELECT 
  'Citas',
  COUNT(*),
  SUM(CASE WHEN estado = 'programada' THEN 1 ELSE 0 END),
  SUM(CASE WHEN estado = 'completada' THEN 1 ELSE 0 END),
  SUM(CASE WHEN estado = 'cancelada' THEN 1 ELSE 0 END)
FROM citas

UNION ALL

SELECT 
  'Expedientes',
  COUNT(*),
  NULL,
  NULL,
  NULL
FROM expedientes

UNION ALL

SELECT 
  'Procedimientos',
  COUNT(*),
  SUM(CASE WHEN activo = TRUE THEN 1 ELSE 0 END),
  NULL,
  NULL
FROM procedimiento

UNION ALL

SELECT 
  'Notificaciones',
  COUNT(*),
  SUM(CASE WHEN enviado = TRUE THEN 1 ELSE 0 END),
  SUM(CASE WHEN enviado = FALSE THEN 1 ELSE 0 END),
  NULL
FROM notificaciones;

-- ==========================================
-- MIGRACIÓN COMPLETADA
-- ==========================================
SELECT '✅ Migración completada exitosamente' as resultado;
SELECT CURRENT_TIMESTAMP as fecha_migracion;
