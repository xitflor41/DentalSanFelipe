# 🔒 Auditoría de Seguridad y Buenas Prácticas

## Estado de Implementación de Recomendaciones Críticas

### ✅ 1. Separación Historia Clínica y Expediente
**Estado:** IMPLEMENTADO CORRECTAMENTE

- ✅ Tablas separadas: `historia_clinica` (datos médicos del paciente) y `expedientes` (registro de visitas)
- ✅ Relación clara: 1 paciente → 1 historia_clinica, 1 paciente → 1 expediente
- ⚠️ **ACCIÓN REQUERIDA:** Documentar en la UI quién puede editar cada uno

**Recomendación implementar:**
- Historia clínica: Solo editable por odontólogos
- Expedientes: Editable por odontólogos y auxiliares (con permisos limitados)

---

### ✅ 2. Adjuntos - NO guardar binarios en BD
**Estado:** IMPLEMENTADO CORRECTAMENTE

```sql
CREATE TABLE adjuntos (
  id_adjunto INT,
  nombreArchivo VARCHAR(255),
  rutaArchivo VARCHAR(512),  -- ✅ Solo guarda ruta
  tipoArchivo VARCHAR(80),    -- ✅ Metadata
  uploaded_at TIMESTAMP,
  creado_por INT              -- ✅ Auditoría
)
```

✅ **CORRECTO:** Guarda rutas, no binarios
⚠️ **FALTA:** Campo para tamaño del archivo y thumbnail

---

### ⚠️ 3. Control de Acceso por Rol
**Estado:** PARCIALMENTE IMPLEMENTADO

**Lo que SÍ existe:**
- ✅ Middleware `requireAuth` y `requireRole`
- ✅ Control en creación/edición de usuarios (solo admin)
- ✅ JWT con información de rol

**Lo que FALTA:**
- ❌ Control de acceso específico para historia clínica
- ❌ Control de acceso específico para expedientes
- ❌ Restricciones a nivel de endpoints en records, consultas, tratamientos

**Roles definidos:**
- `administrador`: Acceso completo
- `odontologo`: Acceso clínico completo
- `auxiliar`: Solo lectura (no implementado consistentemente)

---

### ❌ 4. Soft Delete
**Estado:** NO IMPLEMENTADO

**Problema:** Actualmente se usa DELETE físico:
```sql
ON DELETE CASCADE  -- ❌ Borra permanentemente
```

**Impacto legal:** Los registros médicos deben conservarse por requisitos legales (5-10 años según legislación).

**ACCIÓN CRÍTICA REQUERIDA:**
- Agregar columna `deleted_at TIMESTAMP NULL` a tablas críticas:
  - ✅ `usuarios` (tiene campo `activo`)
  - ❌ `historia_clinica`
  - ❌ `expedientes`
  - ❌ `consulta`
  - ❌ `tratamiento`
  - ❌ `adjuntos`
  - ❌ `citas`

---

### ✅ 5. Auditoría
**Estado:** BIEN IMPLEMENTADO CON MEJORAS

```sql
CREATE TABLE audit_expedientes (
  id_audit INT,
  id_expediente INT,
  id_usuario INT,              -- ✅ Usuario que realizó la acción
  accion VARCHAR(100),         -- ✅ Tipo de acción (CREAR, MODIFICAR, ELIMINAR)
  detalle TEXT,                -- ✅ Detalles adicionales
  fecha TIMESTAMP              -- ✅ Timestamp
)
```

**Puntos fuertes:**
- ✅ Registra usuario
- ✅ Registra acción
- ✅ Timestamp automático
- ✅ Campo detalle flexible (puede guardar JSON con before/after)

**Mejora sugerida:**
- Agregar columnas separadas `data_before JSON` y `data_after JSON` para comparaciones más fáciles

---

### ⚠️ 6. Validaciones Temporales
**Estado:** PARCIALMENTE IMPLEMENTADO

**Columnas de fecha existentes:**
```sql
-- ✅ BIEN: Timestamps con zona horaria implícita
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

-- ⚠️ REVISAR: Fechas sin hora
fecha_cita DATE NOT NULL      -- ❌ Separado de hora
hora_cita DATETIME NOT NULL   -- ⚠️ Debería ser DATETIME o TIMESTAMP

-- ✅ BIEN: Timestamps nullable cuando corresponde
fecha_envio TIMESTAMP NULL
fecha_programada TIMESTAMP NULL
```

**Recomendación:**
- Combinar `fecha_cita` y `hora_cita` en un solo campo `fecha_hora_cita DATETIME`
- Usar TIMESTAMP para fechas que requieren zona horaria
- Documentar la zona horaria usada por el servidor

---

### ❌ 7. Transacciones
**Estado:** NO IMPLEMENTADO

**Operaciones que DEBEN ser atómicas:**
1. Crear consulta + adjuntos + actualizar expediente
2. Crear cita + notificación
3. Crear tratamiento + procedimientos relacionados
4. Modificar expediente + registrar auditoría

**ACCIÓN CRÍTICA:**
Implementar transacciones en los controllers usando:
```javascript
const connection = await pool.getConnection();
await connection.beginTransaction();
try {
  // Operaciones
  await connection.commit();
} catch (error) {
  await connection.rollback();
  throw error;
} finally {
  connection.release();
}
```

---

### ✅ 8. Índices
**Estado:** BIEN IMPLEMENTADO

**Índices existentes:**
```sql
-- ✅ Auditoría
INDEX idx_expediente ON audit_expedientes(id_expediente)
INDEX idx_fecha ON audit_expedientes(fecha)
INDEX idx_usuario ON audit_expedientes(id_usuario)

-- ✅ Notificaciones
INDEX idx_enviado ON notificaciones(enviado)
INDEX idx_fecha_programada ON notificaciones(fecha_programada)

-- ✅ Citas
INDEX idx_citas_paciente_fecha ON citas(id_paciente, fecha_cita, hora_cita)

-- ✅ Agregados en migración
INDEX idx_fecha_cita ON citas(fecha_cita)
INDEX idx_id_paciente ON citas(id_paciente)
INDEX idx_estado ON citas(estado)
INDEX idx_telefono ON pacientes(telefono)
INDEX idx_id_expediente ON consulta(id_expediente)
```

**Excelente cobertura de índices.** ✅

---

## 📊 Resumen de Prioridades

### 🔴 CRÍTICO (Implementar INMEDIATAMENTE)
1. **Soft Delete en tablas clínicas** - Requisito legal
2. **Transacciones en operaciones compuestas** - Integridad de datos
3. **Control de acceso por rol en endpoints clínicos** - Seguridad

### 🟡 IMPORTANTE (Implementar en sprint actual)
4. Combinar fecha_cita + hora_cita en un solo campo
5. Agregar campos `tamano_bytes` y `thumbnail_path` a adjuntos
6. Documentar permisos de edición en UI

### 🟢 MEJORA (Backlog)
7. Separar `data_before` y `data_after` en audit_expedientes
8. Implementar registro de auditoría automático en todos los CUD operations
9. Agregar logs de acceso a registros médicos

---

## 📝 Checklist de Implementación

- [ ] Agregar `deleted_at` a tablas críticas
- [ ] Modificar queries para excluir registros eliminados
- [ ] Implementar transacciones en controllers
- [ ] Agregar middleware de control de acceso a rutas clínicas
- [ ] Combinar campos de fecha/hora en citas
- [ ] Agregar campos de metadata a adjuntos
- [ ] Documentar permisos en README
- [ ] Crear tests de integración para transacciones
- [ ] Implementar logging de auditoría automático

