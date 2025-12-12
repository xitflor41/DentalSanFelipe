# 🐳 Instrucciones para Actualizar la Base de Datos en Docker

## ✅ Lo que ya se aplicó en tu sistema local

La migración **0002_soft_delete_security_v2.sql** agregó exitosamente:

### 📊 Soft Delete (6 tablas)
- ✅ `historia_clinica` - `deleted_at`, `deleted_by`
- ✅ `expedientes` - `deleted_at`, `deleted_by`  
- ✅ `consulta` - `deleted_at`, `deleted_by`
- ✅ `tratamiento` - `deleted_at`, `deleted_by`
- ✅ `adjuntos` - `deleted_at`, `deleted_by`
- ✅ `citas` - `deleted_at`, `deleted_by`

### 📎 Metadata de Adjuntos (3 columnas nuevas)
- ✅ `tamano_bytes` - Tamaño del archivo en bytes
- ✅ `thumbnail_path` - Ruta del thumbnail
- ✅ `mime_type` - Tipo MIME del archivo

### 📝 Auditoría Mejorada (4 columnas nuevas)
- ✅ `data_before` - Estado anterior (JSON)
- ✅ `data_after` - Estado posterior (JSON)
- ✅ `ip_address` - IP del usuario
- ✅ `user_agent` - Navegador del usuario

### 📅 Citas Mejoradas
- ✅ `fecha_hora_cita` - Fecha y hora combinadas

### 🔍 Índices Optimizados (6 nuevos)
- ✅ `idx_historia_deleted`
- ✅ `idx_expedientes_deleted`
- ✅ `idx_consulta_deleted`
- ✅ `idx_tratamiento_deleted`
- ✅ `idx_adjuntos_deleted`
- ✅ `idx_citas_deleted`

---

## 🚀 Para Aplicar lo Mismo en tu Docker de Pruebas

### Opción 1: Ejecutar el script completo (RECOMENDADO)

```powershell
# Desde el directorio dentalSanFelipe-backend
Get-Content src/db/migrations/0002_soft_delete_security_v2.sql | docker exec -i mysql_dentalsanfelipe mysql -uroot -proot dental_sanfelipe
```

### Opción 2: Crear un backup primero y luego ejecutar

```powershell
# 1. Hacer backup
docker exec mysql_dentalsanfelipe mysqldump -uroot -proot dental_sanfelipe > backup_antes_migracion_0002.sql

# 2. Ejecutar migración
Get-Content src/db/migrations/0002_soft_delete_security_v2.sql | docker exec -i mysql_dentalsanfelipe mysql -uroot -proot dental_sanfelipe

# 3. Verificar que todo está bien
docker exec -it mysql_dentalsanfelipe mysql -uroot -proot dental_sanfelipe -e "SHOW COLUMNS FROM expedientes LIKE 'deleted%';"
```

### Opción 3: Desde dentro del contenedor Docker

```powershell
# 1. Copiar el archivo al contenedor
docker cp src/db/migrations/0002_soft_delete_security_v2.sql mysql_dentalsanfelipe:/tmp/

# 2. Entrar al contenedor
docker exec -it mysql_dentalsanfelipe bash

# 3. Ejecutar dentro del contenedor
mysql -uroot -proot dental_sanfelipe < /tmp/0002_soft_delete_security_v2.sql

# 4. Salir
exit
```

---

## ✅ Verificar que se Aplicó Correctamente

### Ver las nuevas columnas en expedientes:
```powershell
docker exec -it mysql_dentalsanfelipe mysql -uroot -proot dental_sanfelipe -e "DESCRIBE expedientes;"
```

Deberías ver `deleted_at` y `deleted_by` al final.

### Ver las nuevas columnas en adjuntos:
```powershell
docker exec -it mysql_dentalsanfelipe mysql -uroot -proot dental_sanfelipe -e "DESCRIBE adjuntos;"
```

Deberías ver `tamano_bytes`, `thumbnail_path`, `mime_type`, `deleted_at`, `deleted_by`.

### Ver las nuevas columnas en audit_expedientes:
```powershell
docker exec -it mysql_dentalsanfelipe mysql -uroot -proot dental_sanfelipe -e "DESCRIBE audit_expedientes;"
```

Deberías ver `data_before`, `data_after`, `ip_address`, `user_agent`.

### Ver todos los índices nuevos:
```powershell
docker exec -it mysql_dentalsanfelipe mysql -uroot -proot dental_sanfelipe -e "SHOW INDEX FROM expedientes WHERE Key_name LIKE 'idx%';"
```

---

## 🔄 Si Algo Sale Mal (Restaurar Backup)

```powershell
# Restaurar desde backup
Get-Content backup_antes_migracion_0002.sql | docker exec -i mysql_dentalsanfelipe mysql -uroot -proot dental_sanfelipe
```

---

## 📦 Para Actualizar la Imagen Base del Docker

Si quieres que estos cambios se apliquen automáticamente al crear nuevos contenedores:

### 1. Actualizar el script SQL base

Agrega las líneas de soft delete al archivo `src/db/dental_sanfelipe.sql` al final:

```sql
-- Soft Delete en tablas críticas
ALTER TABLE historia_clinica ADD COLUMN deleted_at TIMESTAMP NULL, ADD COLUMN deleted_by INT NULL;
ALTER TABLE expedientes ADD COLUMN deleted_at TIMESTAMP NULL, ADD COLUMN deleted_by INT NULL;
ALTER TABLE consulta ADD COLUMN deleted_at TIMESTAMP NULL, ADD COLUMN deleted_by INT NULL;
ALTER TABLE tratamiento ADD COLUMN deleted_at TIMESTAMP NULL, ADD COLUMN deleted_by INT NULL;
ALTER TABLE adjuntos ADD COLUMN deleted_at TIMESTAMP NULL, ADD COLUMN deleted_by INT NULL;
ALTER TABLE citas ADD COLUMN deleted_at TIMESTAMP NULL, ADD COLUMN deleted_by INT NULL;

-- Metadata de adjuntos
ALTER TABLE adjuntos 
  ADD COLUMN tamano_bytes BIGINT NULL,
  ADD COLUMN thumbnail_path VARCHAR(512) NULL,
  ADD COLUMN mime_type VARCHAR(100) NULL;

-- Auditoría mejorada
ALTER TABLE audit_expedientes 
  ADD COLUMN data_before JSON NULL,
  ADD COLUMN data_after JSON NULL,
  ADD COLUMN ip_address VARCHAR(45) NULL,
  ADD COLUMN user_agent TEXT NULL;

-- Fecha/hora combinada en citas
ALTER TABLE citas ADD COLUMN fecha_hora_cita DATETIME NULL;
UPDATE citas SET fecha_hora_cita = TIMESTAMP(fecha_cita, TIME(hora_cita)) WHERE fecha_hora_cita IS NULL;

-- Índices
CREATE INDEX idx_historia_deleted ON historia_clinica(deleted_at);
CREATE INDEX idx_expedientes_deleted ON expedientes(deleted_at);
CREATE INDEX idx_consulta_deleted ON consulta(deleted_at);
CREATE INDEX idx_tratamiento_deleted ON tratamiento(deleted_at);
CREATE INDEX idx_adjuntos_deleted ON adjuntos(deleted_at);
CREATE INDEX idx_citas_deleted ON citas(deleted_at);
```

### 2. Recrear el contenedor (OPCIONAL - solo si quieres empezar de cero)

```powershell
# ⚠️ ESTO BORRA TODOS LOS DATOS
docker-compose down -v
docker-compose up -d
npm run migrate
npm run seed:admin
```

---

## 🎯 Resumen de Comandos Rápidos

```powershell
# Aplicar migración en Docker de pruebas
cd C:\Users\LENOVO\Desktop\DentalSanFelipeProject\dentalSanFelipe-backend
Get-Content src/db/migrations/0002_soft_delete_security_v2.sql | docker exec -i mysql_dentalsanfelipe mysql -uroot -proot dental_sanfelipe

# Verificar
docker exec -it mysql_dentalsanfelipe mysql -uroot -proot dental_sanfelipe -e "SHOW COLUMNS FROM expedientes LIKE 'deleted%';"

# Ver resumen
docker exec -it mysql_dentalsanfelipe mysql -uroot -proot dental_sanfelipe -e "SELECT TABLE_NAME, COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='dental_sanfelipe' AND COLUMN_NAME IN ('deleted_at','deleted_by') ORDER BY TABLE_NAME;"
```

---

## ✅ ¿Qué sigue después de esto?

### Fase 1: Migración aplicada ✅ (COMPLETADO)
- Base de datos actualizada con soft delete

### Fase 2: Actualizar el código (PRÓXIMO)
Necesitas modificar los controllers para usar las nuevas funciones:

```javascript
// En lugar de:
await pool.query('DELETE FROM expedientes WHERE id_expediente = ?', [id]);

// Usar:
import { softDelete, TABLES, ID_COLUMNS } from '../utils/soft-delete.util.js';
await softDelete(TABLES.EXPEDIENTES, ID_COLUMNS.EXPEDIENTES, id, req.user.id_usuario);
```

### Fase 3: Agregar control de acceso (PRÓXIMO)
Agregar los middlewares de control de acceso a las rutas:

```javascript
import { canAccessExpediente, logExpedienteAccess } from '../middlewares/access-control.middleware.js';

// Proteger rutas
router.get('/:id', requireAuth, canAccessExpediente('read'), logExpedienteAccess, getExpediente);
router.put('/:id', requireAuth, canAccessExpediente('write'), updateExpediente);
router.delete('/:id', requireAuth, canDelete, deleteExpediente);
```

¿Quieres que te ayude a actualizar los controllers ahora?
