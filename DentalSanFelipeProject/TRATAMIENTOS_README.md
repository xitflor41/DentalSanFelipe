# Tratamientos y Procedimientos - Documentación

## 📋 Resumen

Implementación completa del módulo de **Tratamientos** vinculados a **Consultas** y **Procedimientos** (catálogo).

### Flujo de Trabajo
1. **Consulta** → Se crea durante la visita del paciente (vinculada a Expediente)
2. **Tratamiento** → Se crea dentro de la consulta, seleccionando un procedimiento del catálogo
3. **Procedimiento** → Catálogo de procedimientos dentales con costos base y categorías

---

## 🗂️ Estructura de Base de Datos

### Tabla: `procedimiento` (Catálogo)
```sql
CREATE TABLE procedimiento (
  id_procedimiento INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  descripcion TEXT,
  categoria VARCHAR(100),               -- Ej: Endodoncia, Ortodoncia, Cirugía
  costo_base DECIMAL(10,2),            -- Costo base del procedimiento
  duracion_estimada INT,               -- Minutos estimados
  activo BOOLEAN DEFAULT TRUE,         -- Estado activo/inactivo
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Tabla: `tratamiento`
```sql
CREATE TABLE tratamiento (
  id_tratamiento INT AUTO_INCREMENT PRIMARY KEY,
  id_procedimiento INT,                -- FK a procedimiento
  id_consulta INT NOT NULL,            -- FK a consulta
  medicamento VARCHAR(255),
  dosis VARCHAR(100),
  viaAdministracion VARCHAR(50),       -- Oral, Intravenosa, Tópica, etc.
  duracion VARCHAR(100),
  efectosAdversos TEXT,
  costo DECIMAL(10,2),                 -- Costo real del tratamiento
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (id_procedimiento) REFERENCES procedimiento(id_procedimiento),
  FOREIGN KEY (id_consulta) REFERENCES consulta(id_consulta)
);
```

---

## 🔄 Migración de Base de Datos

### ⚠️ IMPORTANTE: Ejecutar migración antes de usar el sistema

Si tu tabla `procedimiento` tiene campos antiguos (`nombreProcedimiento`, `costo`), ejecuta:

```bash
# Desde PowerShell en la carpeta backend
cd dentalSanFelipe-backend

# Ejecutar migración
mysql -u root -p dental_sanfelipe < src/db/migrations/update_procedimiento_table.sql
```

**Cambios de la migración:**
- `nombreProcedimiento` → `nombre`
- `costo` → `costo_base`
- Se agregan: `categoria`, `duracion_estimada`, `activo`, `updated_at`

---

## 📁 Archivos Implementados

### Backend

#### Controladores
- ✅ `src/controllers/procedure.controller.js` - CRUD de procedimientos (actualizado con paginación)
- ✅ `src/controllers/treatment.controller.js` - CRUD de tratamientos con JOINs

#### Rutas
- ✅ `src/routes/procedure.routes.js` - Validación de campos actualizada
- ✅ `src/routes/treatment.routes.js` - Rutas de tratamientos

#### Endpoints

**Procedimientos (Catálogo):**
```
GET    /api/procedimientos?page=1&limit=20&q=&categoria=&activo=true
GET    /api/procedimientos/:id
POST   /api/procedimientos
PUT    /api/procedimientos/:id
DELETE /api/procedimientos/:id
```

**Tratamientos:**
```
GET    /api/tratamientos?page=1&limit=20&q=&id_consulta=
GET    /api/tratamientos/:id
POST   /api/tratamientos
PUT    /api/tratamientos/:id
DELETE /api/tratamientos/:id
```

---

### Frontend

#### Servicios
- ✅ `src/app/core/services/tratamiento.service.ts`
  - Interfaces: `Tratamiento`, `TratamientoDetalle`, `Procedimiento`
  - Métodos para tratamientos y procedimientos

#### Páginas - Tratamientos
- ✅ `src/app/pages/tratamientos/listar/tratamientos-listar.page.ts`
  - Tabla paginada con búsqueda
  - Filtro por consulta
  - Ver detalles completos

- ✅ `src/app/pages/tratamientos/crear/tratamientos-crear.page.ts`
  - Formulario completo
  - Selección de consulta (pre-cargada por query param)
  - Selección de procedimiento (auto-llena costo)
  - Campos de medicación (medicamento, dosis, vía, duración)

- ✅ `src/app/pages/tratamientos/ver/tratamientos-ver.page.ts`
  - Visualización completa del tratamiento
  - Información del paciente, consulta y procedimiento

- ✅ `src/app/pages/tratamientos/editar/tratamientos-editar.page.ts`
  - Edición completa del tratamiento

#### Páginas - Procedimientos
- ✅ `src/app/pages/procedimientos/listar/procedimientos-listar.page.ts`
  - Catálogo de procedimientos
  - Búsqueda y paginación
  - Filtro por categoría y estado activo

- ✅ `src/app/pages/procedimientos/crear/procedimientos-crear.page.ts`
  - Formulario: nombre, descripción, categoría, costo base, duración estimada

- ✅ `src/app/pages/procedimientos/editar/procedimientos-editar.page.ts`
  - Edición de procedimientos del catálogo

#### Rutas
```typescript
// src/app/app.routes.ts
{
  path: 'tratamientos',
  loadChildren: () => import('./pages/tratamientos/tratamientos.routes')
},
{
  path: 'procedimientos',
  loadChildren: () => import('./pages/procedimientos/procedimientos.routes')
}
```

#### Navegación
- ✅ Navbar actualizado con enlaces a Tratamientos y Procedimientos
- ✅ Integración desde Consultas: botón "Crear Tratamiento" en vista de consulta

---

## 🎯 Flujo de Uso

### 1. Configurar Catálogo de Procedimientos
1. Ir a **Procedimientos** → **Crear**
2. Ingresar: Nombre, Categoría, Costo Base, Duración
3. Ejemplos:
   - Limpieza Dental | Profilaxis | $500 | 30min
   - Endodoncia | Endodoncia | $3000 | 90min
   - Extracción | Cirugía | $800 | 45min

### 2. Crear Tratamiento desde Consulta
1. Ir a **Consultas** → Ver consulta
2. Click en "Crear Tratamiento"
3. Seleccionar procedimiento del catálogo (costo se auto-llena)
4. Ingresar medicación (opcional): medicamento, dosis, vía, duración
5. Agregar efectos adversos si aplica
6. Guardar

### 3. Gestionar Tratamientos
- **Listar**: Ver todos los tratamientos con búsqueda y filtros
- **Ver**: Detalles completos con información del paciente
- **Editar**: Modificar medicación, costo, efectos adversos
- **Eliminar**: Remover tratamiento

---

## 🔗 Integraciones

### Consulta ↔ Tratamiento
- Desde vista de consulta se puede crear tratamiento directamente
- Query param `id_consulta` pre-selecciona la consulta en el formulario
- Listado de tratamientos puede filtrarse por `id_consulta`

### Procedimiento ↔ Tratamiento
- Procedimiento proporciona información base (nombre, categoría, costo)
- Tratamiento puede ajustar el costo final
- Auto-llenado de costo al seleccionar procedimiento

---

## 🎨 Diseño

### Variables CSS
```css
--primary: #0ea5e9;    /* Sky blue */
--success: #10b981;    /* Green */
--warning: #f59e0b;    /* Amber */
--danger: #ef4444;     /* Red */
```

### Componentes
- Tablas responsivas con hover
- Formularios con validación
- Badges de estado (Activo/Inactivo)
- Botones con iconos
- Paginación consistente

---

## ✅ Checklist de Implementación

### Backend
- [x] Controller de procedimientos con paginación
- [x] Controller de tratamientos con JOINs
- [x] Rutas con validación actualizada
- [x] Migración SQL para actualizar tabla
- [x] Schema actualizado en dental_sanfelipe.sql

### Frontend
- [x] Servicio de tratamientos con interfaces
- [x] CRUD completo de tratamientos (4 páginas)
- [x] CRUD completo de procedimientos (3 páginas)
- [x] Rutas lazy-loading configuradas
- [x] Navbar actualizado
- [x] Integración desde consultas

### Database
- [x] Tabla procedimiento actualizada
- [x] Tabla tratamiento con FKs correctas
- [x] Script de migración creado

---

## 🧪 Testing

### Verificar Backend
```bash
# Listar procedimientos
curl http://localhost:3000/api/procedimientos

# Listar tratamientos
curl http://localhost:3000/api/tratamientos
```

### Verificar Frontend
1. Iniciar servidor: `ng serve`
2. Navegar a `http://localhost:4200/procedimientos`
3. Navegar a `http://localhost:4200/tratamientos`

---

## 📝 Notas Adicionales

### Categorías de Procedimientos Sugeridas
- Profilaxis / Limpieza
- Endodoncia
- Ortodoncia
- Periodoncia
- Cirugía
- Restauración / Obturaciones
- Prótesis
- Radiología
- Urgencias

### Vías de Administración
- Oral
- Intravenosa (IV)
- Intramuscular (IM)
- Subcutánea (SC)
- Tópica
- Sublingual

---

## 🚀 Próximos Pasos

1. **Ejecutar migración SQL** en base de datos existente
2. **Poblar catálogo** de procedimientos comunes
3. **Probar flujo completo**: Consulta → Crear Tratamiento → Seleccionar Procedimiento
4. **Validar cálculos** de costos y duraciones

---

**Última actualización**: Sistema completo de Tratamientos y Procedimientos implementado
**Estado**: ✅ Listo para usar (después de ejecutar migración)
