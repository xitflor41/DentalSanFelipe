# ✅ Sistema de Adjuntos Implementado

## 🎯 Funcionalidades

### Upload de Archivos
- ✅ Subir imágenes (JPG, PNG, WEBP) y PDFs
- ✅ Límite de 10MB por archivo
- ✅ Barra de progreso en tiempo real
- ✅ Nombre descriptivo opcional
- ✅ Validación de tipos de archivo
- ✅ Storage en carpeta `uploads/adjuntos/`

### Gestión de Adjuntos
- ✅ Listar todos los adjuntos por expediente
- ✅ Vista previa de imágenes (modal)
- ✅ Descargar archivos
- ✅ Eliminar adjuntos (solo administrador)
- ✅ Información de quién subió el archivo
- ✅ Iconos según tipo de archivo (🖼️ imagen, 📄 PDF)

### Seguridad
- ✅ Autenticación requerida
- ✅ Control de roles (admin/odontologo/auxiliar)
- ✅ Validación de rutas de archivo
- ✅ Eliminación en cascada si se borra expediente
- ✅ Registro de auditoría

---

## 📁 Estructura de Archivos

### Backend
```
src/
├── controllers/attachment.controller.js   ✅ CRUD completo
├── routes/attachment.routes.js            ✅ Endpoints configurados
├── middlewares/upload.middleware.js       ✅ Multer configurado
└── db/dental_sanfelipe.sql               ✅ Tabla adjuntos
```

### Frontend
```
src/app/
├── core/services/attachment.service.ts              ✅ Servicio HTTP
└── pages/records/
    ├── adjuntos/adjuntos-manager.component.ts      ✅ Componente gestión
    └── ver/records-ver.page.ts                     ✅ Integración en vista
```

---

## 🔌 API Endpoints

### POST `/api/adjuntos`
Subir archivo (multipart/form-data)
- **Body**: `file` (archivo), `id_expediente` (number), `nombre` (string, opcional)
- **Auth**: Sí (admin/odontologo/auxiliar)
- **Response**: Adjunto creado

### GET `/api/adjuntos/expediente/:id`
Listar adjuntos por expediente
- **Auth**: Sí
- **Response**: Array de Adjunto con info del usuario que subió

### GET `/api/adjuntos/:id/download`
Descargar archivo
- **Auth**: Sí
- **Response**: Archivo descargado

### DELETE `/api/adjuntos/:id`
Eliminar adjunto
- **Auth**: Sí (solo admin)
- **Response**: Confirmación

---

## 📊 Estructura de Tabla

```sql
CREATE TABLE adjuntos (
  id_adjunto INT AUTO_INCREMENT PRIMARY KEY,
  id_expediente INT NOT NULL,
  nombreArchivo VARCHAR(255) NOT NULL,
  rutaArchivo VARCHAR(512) NOT NULL,
  tipoArchivo VARCHAR(80),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  creado_por INT NULL,
  FOREIGN KEY (id_expediente) REFERENCES expedientes(id_expediente) ON DELETE CASCADE,
  FOREIGN KEY (creado_por) REFERENCES usuarios(id_usuario) ON DELETE SET NULL
);
```

---

## 🎨 Interfaz de Usuario

### Sección de Upload
- Campo de nombre descriptivo
- Selector de archivo con preview del nombre
- Botón de subida con progreso
- Mensajes de éxito/error

### Lista de Adjuntos
- Grid responsive de tarjetas
- Icono según tipo de archivo
- Nombre del archivo
- Fecha de subida
- Usuario que lo subió
- Botones: Ver (solo imágenes), Descargar, Eliminar

### Modal de Vista Previa
- Preview de imágenes en pantalla completa
- Zoom y scroll para imágenes grandes
- Cerrar con click fuera o botón X

---

## 🚀 Casos de Uso

### 1. Subir Radiografía Panorámica
1. Ir a Expedientes → Ver Expediente
2. Scroll a sección "Adjuntos"
3. Escribir: "Radiografía Panorámica - Dic 2025"
4. Seleccionar archivo de imagen
5. Click "Subir Archivo"
6. Ver progreso → Confirmación de éxito

### 2. Ver Radiografía
1. En lista de adjuntos, click icono 👁️
2. Ver imagen en modal de pantalla completa
3. Click fuera o X para cerrar

### 3. Descargar PDF
1. Localizar documento en lista
2. Click botón ⬇️
3. Archivo se descarga al sistema

### 4. Eliminar Archivo Incorrecto
1. Click botón 🗑️ (solo admin)
2. Confirmar eliminación
3. Archivo se elimina de DB y disco

---

## ⚙️ Configuración

### Límites Actuales
- Tamaño máximo: **10 MB**
- Formatos permitidos: **JPG, PNG, WEBP, PDF**
- Storage: `uploads/adjuntos/`

### Modificar Configuración
Editar `src/middlewares/upload.middleware.js`:

```javascript
// Cambiar tamaño máximo (en bytes)
limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB

// Agregar más formatos
const allowed = [
  "image/jpeg", "image/png", "image/webp", 
  "application/pdf", 
  "application/msword"  // Agregar Word
];
```

---

## 🔒 Permisos

| Acción           | Admin | Odontólogo | Auxiliar |
|------------------|-------|------------|----------|
| Subir archivo    | ✅     | ✅          | ✅        |
| Ver/Listar       | ✅     | ✅          | ✅        |
| Descargar        | ✅     | ✅          | ✅        |
| Eliminar         | ✅     | ❌          | ❌        |

---

## 📝 Notas Técnicas

### Storage
- Archivos guardados en `dentalSanFelipe-backend/uploads/adjuntos/`
- Nombres de archivo: `timestamp_nombreoriginal.ext`
- Ruta relativa guardada en DB

### Seguridad
- Validación de tipo MIME
- Sanitización de nombres de archivo
- Verificación de ruta (no permitir path traversal)
- Auth tokens en todas las peticiones

### Eliminación en Cascada
Si se elimina un expediente, todos sus adjuntos se borran automáticamente (ON DELETE CASCADE).

---

## ✨ Características Adicionales Posibles

Si necesitas:
- ✨ Thumbnails automáticos para imágenes
- ✨ Rotación de imágenes en el visor
- ✨ Anotaciones/marcas en radiografías
- ✨ Compresión automática de imágenes
- ✨ Envío de adjuntos por correo
- ✨ Vinculación a consultas específicas (no solo expedientes)

Solo avísame y lo implementamos.

---

**Sistema de Adjuntos completamente funcional** 🎉
