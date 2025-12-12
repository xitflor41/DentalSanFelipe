# 🦷 Dental San Felipe - Sistema de Gestión Dental

Sistema completo de gestión para clínicas dentales desarrollado con Angular, Node.js/Express y MySQL.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Docker](https://img.shields.io/badge/docker-ready-brightgreen.svg)
![Node](https://img.shields.io/badge/node-20.x-green.svg)
![Angular](https://img.shields.io/badge/angular-20.3-red.svg)

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Instalación Rápida](#-instalación-rápida-con-docker)
- [Configuración](#️-configuración)
- [Actualizar el Sistema](#-actualizar-el-sistema)
- [Comandos Útiles](#️-comandos-útiles)
- [Notificaciones WhatsApp](#-notificaciones-por-whatsapp)
- [Soporte y Contribución](#-soporte-y-contribución)

---

## ✨ Características

- ✅ **Gestión de Pacientes**: Registro completo con historial clínico
- ✅ **Sistema de Citas**: Calendario interactivo con disponibilidad
- ✅ **Control de Acceso**: 3 roles (Administrador, Odontólogo, Auxiliar)
- ✅ **Notificaciones WhatsApp**: Confirmación automática de citas vía Twilio
- ✅ **Docker**: Despliegue en contenedores (MySQL + Backend + Frontend)
- ✅ **Seguridad**: JWT tokens, validación de roles, soft delete
- ✅ **Responsive**: Interfaz adaptable a móviles y tablets

---

## 📁 Estructura del Proyecto

```
DentalSanFelipeProject/
├── dentalSanFelipe-backend/     # API REST con Node.js/Express
│   ├── src/
│   │   ├── controllers/         # Lógica de negocio
│   │   ├── routes/              # Endpoints API
│   │   ├── services/            # Servicios (WhatsApp, auth, etc.)
│   │   ├── middlewares/         # Auth, validación, errores
│   │   └── config/              # Configuración DB y env
│   ├── Dockerfile               # Imagen Docker backend
│   └── package.json
│
├── dentalSanFelipe-frontend/    # Aplicación Angular
│   ├── src/
│   │   ├── app/
│   │   │   ├── pages/           # Páginas principales
│   │   │   ├── core/            # Guards, interceptors, services
│   │   │   └── components/      # Componentes reutilizables
│   │   └── index.html
│   ├── Dockerfile               # Imagen Docker frontend
│   ├── nginx.conf               # Configuración Nginx
│   └── angular.json
│
├── docker-compose.yml           # Orquestación de contenedores
├── .env.example                 # Plantilla de variables de entorno
└── README.md                    # Este archivo
```

---

## 🚀 Instalación Rápida con Docker

### Prerequisitos

- **Docker Desktop** instalado ([Descargar aquí](https://www.docker.com/products/docker-desktop))
- **Git** instalado (opcional) ([Descargar aquí](https://git-scm.com/downloads))

### Instalación en 3 Pasos

#### Opción A: Usando Git (Recomendado)

```bash
# 1. Clonar el repositorio
git clone https://github.com/TU-USUARIO/DentalSanFelipeProject.git
cd DentalSanFelipeProject

# 2. Configurar variables de entorno (opcional)
# En Windows:
copy .env.example .env

# En Linux/Mac:
cp .env.example .env

# 3. Iniciar todos los servicios
docker-compose up -d
```

#### Opción B: Descarga Directa (Sin Git)

1. **Descarga el proyecto**: 
   - Ve a https://github.com/TU-USUARIO/DentalSanFelipeProject
   - Click en "Code" → "Download ZIP"
   - Extrae el archivo ZIP

2. **Abre una terminal** en la carpeta extraída

3. **Configura y ejecuta**:
   ```bash
   # Windows
   copy .env.example .env
   docker-compose up -d

   # Linux/Mac
   cp .env.example .env
   docker-compose up -d
   ```

#### Opción C: Instalación con Script Automático

**Windows:**
```powershell
# Descargar e instalar automáticamente
git clone https://github.com/TU-USUARIO/DentalSanFelipeProject.git
cd DentalSanFelipeProject
.\install.bat
```

**Linux/Mac:**
```bash
# Descargar e instalar automáticamente
git clone https://github.com/TU-USUARIO/DentalSanFelipeProject.git
cd DentalSanFelipeProject
chmod +x install.sh
./install.sh
```

**¡Listo!** Espera 1-2 minutos mientras se construyen y arrancan los contenedores.

### 🎯 Acceso a la Aplicación

Abre tu navegador en:

- **Frontend (Interfaz)**: http://localhost:4200
- **Backend (API)**: http://localhost:3000
- **Base de Datos**: localhost:3306

### 👤 Usuario por Defecto

```
Usuario: admin
Contraseña: Admin123!
```

## 📦 Servicios Incluidos

El sistema incluye 3 contenedores Docker:

1. **Frontend** (Angular + Nginx) - Puerto 4200
2. **Backend** (Node.js + Express) - Puerto 3000
3. **Base de Datos** (MySQL 8.0) - Puerto 3306

## 📋 Características Principales

### 👥 Gestión de Usuarios (3 Roles)
- **Administrador**: Gestión completa del sistema, usuarios, configuración
- **Odontólogo**: Gestión clínica completa, expedientes, tratamientos
- **Auxiliar**: Visualización y soporte administrativo

### 🏥 Módulos Clínicos
- **Pacientes**: Registro completo con historia clínica
- **Expedientes**: Odontograma, historia clínica, observaciones
- **Consultas**: Registro detallado de cada visita
- **Tratamientos**: Planificación y seguimiento
- **Procedimientos**: Catálogo configurable

### 📅 Gestión de Citas
- Calendario de citas
- Estados: Programada, Completada, Cancelada
- Recordatorios automáticos por WhatsApp 24h antes

### 📱 Notificaciones WhatsApp
- Envío automático de recordatorios
- Integración con Twilio WhatsApp API
- Sistema de reintentos y logs
- Modo simulación para desarrollo

### 📎 Adjuntos
- Subida de radiografías y documentos
- Formatos: JPG, PNG, WEBP, PDF
- Límite: 10MB por archivo
- Almacenamiento en filesystem

### 📊 Auditoría
- Log completo de todas las operaciones
- Timeline visual de cambios
- Estadísticas de uso

---

## 📥 Métodos de Instalación Detallados

### 1️⃣ Desde GitHub (Desarrollo y Producción)

```bash
# Clonar el repositorio completo
git clone https://github.com/TU-USUARIO/DentalSanFelipeProject.git
cd DentalSanFelipeProject

# Configurar
cp .env.example .env
nano .env  # o usa notepad .env en Windows

# Iniciar
docker-compose up -d
```

**Ventajas:**
- ✅ Siempre tienes la última versión
- ✅ Puedes hacer `git pull` para actualizar
- ✅ Fácil contribuir con mejoras
- ✅ Historial completo de cambios

### 2️⃣ Descarga Rápida (Sin Git)

```bash
# 1. Descargar ZIP desde GitHub
https://github.com/TU-USUARIO/DentalSanFelipeProject/archive/refs/heads/main.zip

# 2. Extraer y entrar a la carpeta
cd DentalSanFelipeProject-main

# 3. Configurar e iniciar
copy .env.example .env
docker-compose up -d
```

**Ventajas:**
- ✅ No necesitas Git
- ✅ Instalación más rápida
- ✅ Ideal para usuarios finales

### 3️⃣ Fork para Desarrollo

```bash
# 1. Hacer Fork en GitHub (click en "Fork")

# 2. Clonar TU fork
git clone https://github.com/TU-USUARIO/DentalSanFelipeProject.git
cd DentalSanFelipeProject

# 3. Agregar repositorio original como upstream
git remote add upstream https://github.com/USUARIO-ORIGINAL/DentalSanFelipeProject.git

# 4. Desarrollar
git checkout -b mi-nueva-funcionalidad
# ... hacer cambios ...
git commit -am "Descripción de cambios"
git push origin mi-nueva-funcionalidad
```

**Ventajas:**
- ✅ Puedes hacer cambios sin afectar el original
- ✅ Fácil crear Pull Requests
- ✅ Mantener tu versión personalizada

---

## 📦 Actualizar el Sistema

### Desde GitHub

```bash
# Detener servicios
docker-compose down

# Guardar tus cambios (si los tienes)
git stash

# Actualizar código
git pull origin main

# Restaurar tus cambios
git stash pop

# Reconstruir y reiniciar
docker-compose build
docker-compose up -d
```

### Desde ZIP

1. Descarga la nueva versión del repositorio
2. Detén los contenedores: `docker-compose down`
3. **NO ELIMINES** el archivo `.env` (conserva tu configuración)
4. Reemplaza todos los archivos excepto `.env`
5. Reconstruye: `docker-compose build`
6. Inicia: `docker-compose up -d`

---

## 🛠️ Comandos Útiles

```bash
# Iniciar todos los servicios
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql

# Detener todos los servicios
docker-compose down

# Detener y eliminar volúmenes (¡CUIDADO! Borra la base de datos)
docker-compose down -v

# Reiniciar un servicio
docker-compose restart backend

# Reconstruir imágenes
docker-compose build
docker-compose up -d --build

# Ver estado de los servicios
docker-compose ps

# Acceder al contenedor del backend
docker exec -it dental_backend sh

# Acceder a MySQL
docker exec -it dental_mysql mysql -uroot -prootpassword dental_sanfelipe
```

## ⚙️ Configuración

### Variables de Entorno

El archivo `.env.example` contiene todas las variables configurables:

```env
# Puertos
FRONTEND_PORT=4200
BACKEND_PORT=3000
DB_PORT=3306

# Base de datos
DB_NAME=dental_sanfelipe
DB_USER=dentaluser
DB_PASSWORD=dentalpass

# Seguridad (CAMBIAR EN PRODUCCIÓN)
JWT_SECRET=tu_clave_secreta_aqui
JWT_REFRESH_SECRET=tu_clave_refresh_aqui

# WhatsApp (opcional)
WHATSAPP_ENABLED=false
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_FROM=
```

### Activar Notificaciones de WhatsApp

1. Crear cuenta en [Twilio](https://www.twilio.com/try-twilio) (incluye $15 gratis)
2. Configurar WhatsApp Sandbox
3. Actualizar variables en `.env`:
   ```env
   WHATSAPP_ENABLED=true
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxx
   TWILIO_AUTH_TOKEN=xxxxxxxxxx
   TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
   ```
4. Reiniciar: `docker-compose restart backend`

📖 **Guía completa**: [ACTIVAR_WHATSAPP.md](./dentalSanFelipe-backend/ACTIVAR_WHATSAPP.md)

## 📊 Backup de Base de Datos

### Crear Backup

```bash
# Backup completo
docker exec dental_mysql mysqldump -uroot -prootpassword dental_sanfelipe > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup solo estructura
docker exec dental_mysql mysqldump -uroot -prootpassword --no-data dental_sanfelipe > estructura.sql
```

### Restaurar Backup

```bash
docker exec -i dental_mysql mysql -uroot -prootpassword dental_sanfelipe < backup.sql
```

## 🔐 Roles y Permisos

### Administrador
- ✅ Acceso total al sistema
- ✅ Gestión de usuarios
- ✅ Ver todos los pacientes
- ✅ Eliminar registros

### Odontólogo
- ✅ Ver solo pacientes asignados
- ✅ Crear y editar citas
- ✅ Gestionar expedientes
- ✅ Realizar consultas
- ❌ No puede eliminar

### Auxiliar
- ✅ Ver datos limitados de pacientes
- ✅ Crear pacientes
- ✅ Agendar citas
- ❌ Solo lectura en procedimientos
- ❌ No puede editar ni eliminar

## 🐛 Solución de Problemas

### Error: Puerto ya en uso

```bash
# Cambiar puertos en .env
FRONTEND_PORT=8080
BACKEND_PORT=5000
DB_PORT=3307

# Reiniciar
docker-compose down
docker-compose up -d
```

### Error: Conexión a base de datos fallida

```bash
# Verificar que MySQL esté corriendo
docker-compose ps

# Ver logs de MySQL
docker-compose logs mysql

# Reiniciar servicio
docker-compose restart mysql
```

### Los cambios en .env no se aplican

```bash
# Recrear contenedores
docker-compose down
docker-compose up -d
```

### Frontend muestra error de conexión

1. Verificar que el backend esté corriendo: http://localhost:3000
2. Ver logs: `docker-compose logs backend`
3. Verificar que MySQL esté saludable: `docker-compose ps`

---

## 🛠️ Stack Tecnológico

### Backend
- **Node.js** 20+ con Express
- **MySQL** 8.0 (Docker)
- **JWT** para autenticación
- **Bcrypt** para contraseñas
- **Multer** para archivos
- **Twilio** para WhatsApp

### Frontend
- **Angular** 20.3.10
- **Standalone Components**
- **Signals API**
- **TypeScript**
- **RxJS**

---

## 🚀 Instalación Rápida

### Prerrequisitos
```bash
# Verificar versiones
node --version  # v18.0.0 o superior
npm --version   # v9.0.0 o superior
docker --version # v20.0.0 o superior
```

### 1. Clonar Repositorio
```bash
git clone <repository-url>
cd DentalSanFelipeProject
```

### 2. Configurar Backend

```bash
cd dentalSanFelipe-backend

# Instalar dependencias
npm install

# Copiar archivo de configuración
copy .env.example .env

# Editar .env con tus configuraciones
# notepad .env  (Windows)
# nano .env     (Linux/Mac)
```

#### Variables importantes en `.env`:
```env
# Base de datos (si usas Docker, estos valores están OK)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=root
DB_NAME=dental_sanfelipe

# JWT Secrets (CAMBIAR EN PRODUCCIÓN)
JWT_SECRET=tu_clave_secreta_jwt_muy_segura_cambiala_en_produccion
JWT_REFRESH_SECRET=tu_clave_secreta_refresh_jwt_muy_segura_cambiala_en_produccion

# WhatsApp (ver WHATSAPP_SETUP.md para detalles)
WHATSAPP_SIMULATION_MODE=true
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=tu_auth_token_aqui
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

### 3. Iniciar Base de Datos (Docker)

```bash
# Iniciar MySQL en Docker
docker-compose up -d

# Verificar que esté corriendo
docker ps

# Esperar 10 segundos para que MySQL inicie completamente
```

### 4. Ejecutar Migraciones

```bash
# Copiar script de migración al contenedor
docker cp src/db/migrations/0001_complete_setup.sql mysql_dentalsanfelipe:/tmp/

# Ejecutar migración
docker exec -i mysql_dentalsanfelipe mysql -uroot -proot dental_sanfelipe < /tmp/0001_complete_setup.sql
```

### 5. Crear Usuario Administrador

```bash
# Ejecutar seed
node src/db/seed-admin.js
```

Credenciales por defecto:
- **Usuario**: `admin`
- **Contraseña**: `Admin123!`

### 6. Iniciar Backend

```bash
npm run dev
# o
node server.js
```

El servidor estará en: `http://localhost:3000`

### 7. Configurar Frontend

```bash
cd ../dentalSanFelipe-frontend

# Instalar dependencias
npm install

# Verificar que apunte al backend correcto
# Editar src/app/core/services/*.service.ts si es necesario
# API_URL debe ser: http://localhost:3000/api

# Iniciar servidor de desarrollo
npm start
```

El frontend estará en: `http://localhost:4200`

### 8. Iniciar Worker de Notificaciones (Opcional)

En una nueva terminal:

```bash
cd dentalSanFelipe-backend
node src/workers/notification.worker.js
```

---

## 🧪 Probar el Sistema

### 1. Iniciar Sesión
- Ve a `http://localhost:4200`
- Usuario: `admin`
- Contraseña: `Admin123!`

### 2. Crear Usuarios
- Ve a **Usuarios** (solo visible para admin)
- Crea un Odontólogo
- Crea un Auxiliar

### 3. Crear Paciente
- Ve a **Pacientes** → **Crear**
- **IMPORTANTE**: Incluye número de teléfono para notificaciones WhatsApp
- Formato: `+52XXXXXXXXXX` (con código de país)

### 4. Crear Expediente
- Ve al paciente creado
- Click en **Ver Expediente**
- Rellena historia clínica, odontograma, etc.

### 5. Crear Cita
- Ve a **Citas** → **Crear**
- Selecciona el paciente
- Programa una cita
- ✅ Automáticamente se creará una notificación WhatsApp

### 6. Verificar Notificación (Base de datos)

```bash
docker exec -it mysql_dentalsanfelipe mysql -uroot -proot

USE dental_sanfelipe;

SELECT * FROM notificaciones ORDER BY created_at DESC LIMIT 1;
```

Deberías ver:
- `telefono`: El del paciente
- `mensaje`: Personalizado con nombre y fecha
- `fecha_programada`: 24h antes de la cita
- `enviado`: false (hasta que el worker la procese)

---

## 📱 Configurar WhatsApp (Producción)

Para enviar notificaciones reales por WhatsApp:

1. **Lee la guía completa**: [WHATSAPP_SETUP.md](./WHATSAPP_SETUP.md)

2. **Resumen rápido**:
   - Crea cuenta en [Twilio](https://www.twilio.com/try-twilio)
   - Copia credenciales a `.env`
   - Conecta tu WhatsApp al sandbox (envía `join <palabra>`)
   - Cambia `WHATSAPP_SIMULATION_MODE=false`
   - Reinicia el worker

3. **Instala dependencia**:
```bash
npm install twilio
```

---

## 🐳 Comandos Docker Útiles

```bash
# Ver logs de MySQL
docker logs mysql_dentalsanfelipe

# Conectar a MySQL
docker exec -it mysql_dentalsanfelipe mysql -uroot -proot dental_sanfelipe

# Detener contenedor
docker-compose down

# Reiniciar limpio (CUIDADO: borra datos)
docker-compose down -v
docker-compose up -d

# Backup de base de datos
docker exec mysql_dentalsanfelipe mysqldump -uroot -proot dental_sanfelipe > backup_$(date +%Y%m%d).sql

# Restaurar backup
docker exec -i mysql_dentalsanfelipe mysql -uroot -proot dental_sanfelipe < backup_20251210.sql
```

---

## 📁 Estructura del Proyecto

```
DentalSanFelipeProject/
├── dentalSanFelipe-backend/
│   ├── src/
│   │   ├── config/          # Configuraciones (DB, env)
│   │   ├── controllers/     # Lógica de negocio
│   │   ├── routes/          # Rutas de API
│   │   ├── middlewares/     # Auth, upload, errors
│   │   ├── services/        # Servicios reutilizables
│   │   ├── workers/         # notification.worker.js
│   │   └── db/
│   │       ├── dental_sanfelipe.sql
│   │       ├── seed-admin.js
│   │       └── migrations/
│   ├── uploads/adjuntos/    # Archivos subidos
│   ├── .env                 # Configuración (NO subir a Git)
│   ├── .env.example         # Plantilla de configuración
│   ├── docker-compose.yml   # MySQL en Docker
│   ├── package.json
│   └── server.js
│
└── dentalSanFelipe-frontend/
    ├── src/
    │   ├── app/
    │   │   ├── core/
    │   │   │   ├── guards/      # auth.guard.ts
    │   │   │   ├── interceptors/ # auth.interceptor.ts
    │   │   │   └── services/    # Servicios HTTP
    │   │   ├── pages/
    │   │   │   ├── login/
    │   │   │   ├── dashboard/
    │   │   │   ├── pacientes/
    │   │   │   ├── appointments/
    │   │   │   ├── records/     # Expedientes
    │   │   │   ├── consultas/
    │   │   │   ├── tratamientos/
    │   │   │   ├── procedimientos/
    │   │   │   └── usuarios/    # Solo admin
    │   │   └── shared/          # Componentes compartidos
    │   └── styles.css
    ├── angular.json
    ├── package.json
    └── tsconfig.json
```

---

## 🔐 Seguridad

### Producción
- [ ] Cambiar `JWT_SECRET` y `JWT_REFRESH_SECRET` en `.env`
- [ ] Cambiar contraseña de admin después del primer login
- [ ] Usar HTTPS en producción
- [ ] Configurar CORS adecuadamente
- [ ] Cambiar credenciales de MySQL
- [ ] Usar certificados SSL para MySQL
- [ ] Activar rate limiting
- [ ] Revisar logs regularmente

### Desarrollo
- ✅ `.env` está en `.gitignore`
- ✅ Contraseñas hasheadas con bcrypt
- ✅ JWT con expiración
- ✅ Validación de roles en backend y frontend
- ✅ Sanitización de inputs

---

## 🐛 Troubleshooting

### Backend no inicia

```bash
# Verificar que MySQL esté corriendo
docker ps

# Ver logs
docker logs mysql_dentalsanfelipe

# Verificar conexión
docker exec -it mysql_dentalsanfelipe mysql -uroot -proot -e "SHOW DATABASES;"
```

### Frontend no puede conectarse al backend

1. Verifica que el backend esté corriendo en puerto 3000
2. Revisa la consola del navegador (F12)
3. Verifica que las URLs en los servicios sean correctas:
   - `src/app/core/services/*.service.ts`
   - Deben tener: `http://localhost:3000/api`

### Errores de CORS

En `server.js` del backend, asegúrate de tener:

```javascript
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));
```

### Worker de notificaciones no envía mensajes

1. Verifica que el worker esté corriendo
2. Revisa la consola del worker para errores
3. Verifica que `WHATSAPP_SIMULATION_MODE` esté configurado correctamente
4. Si es modo producción, verifica credenciales de Twilio

---

## 🔒 Seguridad y Buenas Prácticas

### ✅ Implementado
- **Soft Delete**: Eliminación lógica en tablas clínicas (requisito legal)
- **Auditoría completa**: Registro de todas las operaciones con before/after
- **Control de acceso por rol**: Permisos granulares por endpoint
- **Adjuntos seguros**: Almacenamiento en filesystem, NO en BD
- **Transacciones**: Operaciones atómicas para integridad
- **Índices optimizados**: Queries eficientes en tablas grandes
- **JWT con refresh tokens**: Sesiones seguras de 15min + renovación

### 🛡️ Permisos por Rol
- **Administrador**: 
  - Gestión completa de usuarios
  - Acceso total a expedientes
  - Configuración del sistema
  
- **Odontólogo**:
  - Crear/editar/eliminar expedientes
  - Crear/editar historia clínica
  - Ver expedientes de otros odontólogos (solo lectura)
  - Gestionar sus propios tratamientos
  
- **Auxiliar**:
  - Ver pacientes y expedientes (solo lectura)
  - Agendar citas
  - No puede modificar información clínica

### 📋 Auditoría
Todas las operaciones en expedientes se registran con:
- Usuario que realizó la acción
- Timestamp con zona horaria
- Estado anterior y posterior (JSON)
- Dirección IP y User Agent
- Tipo de acción (CREATE, UPDATE, DELETE, ACCESS)

Ver detalles en: [SECURITY_AUDIT.md](./SECURITY_AUDIT.md)

---

## 📝 Tareas Pendientes / Roadmap

### Alta Prioridad
- [ ] Ejecutar migración 0002 (soft delete) en producción
- [ ] Actualizar controllers para usar soft delete
- [ ] Implementar logging automático en todos los CUD operations
- [ ] Tests de integración para transacciones

### Features
- [ ] Implementar paginación en todas las listas
- [ ] Agregar búsqueda avanzada de pacientes
- [ ] Dashboard con estadísticas y gráficas
- [ ] Reportes en PDF (expedientes, recetas)
- [ ] Calendario visual de citas
- [ ] Integración con servicios de pago
- [ ] App móvil (React Native o Flutter)
- [ ] Sistema de inventario de materiales
- [ ] Multi-tenancy (múltiples clínicas)
- [ ] Backup automático de base de datos

---

## 👥 Equipo de Desarrollo

**Roles del Sistema**:
- Administrador: Gestión completa
- Odontólogo: Atención clínica
- Auxiliar: Soporte administrativo

---

## 📄 Licencia

[Especifica tu licencia aquí]

---

## 📞 Soporte y Contribución

### 🐛 Reportar Problemas

Si encuentras un error:

1. **Revisa los issues existentes**: Puede que ya esté reportado
2. **Incluye información**:
   - Versión del sistema (git commit hash o versión)
   - Logs relevantes (`docker-compose logs -f`)
   - Pasos para reproducir el error
   - Capturas de pantalla si aplica

### 🤝 Contribuir

¿Quieres mejorar el sistema?

1. **Fork** el repositorio
2. **Crea una rama** para tu feature: `git checkout -b feature/nueva-funcionalidad`
3. **Commit** tus cambios: `git commit -m 'Agrega nueva funcionalidad'`
4. **Push** a la rama: `git push origin feature/nueva-funcionalidad`
5. **Abre un Pull Request** describiendo los cambios

### 📚 Recursos Adicionales

- [WHATSAPP_CONFIG.md](./WHATSAPP_CONFIG.md) - Configuración detallada de WhatsApp
- [DOCKER_HUB.md](./DOCKER_HUB.md) - Publicar imágenes en Docker Hub
- [ACTIVAR_WHATSAPP.md](./ACTIVAR_WHATSAPP.md) - Guía para activar Twilio

### 💬 Contacto

Para preguntas o sugerencias:
- 📧 Email: [tu-email@ejemplo.com]
- 🐙 GitHub Issues: [Abrir issue](https://github.com/TU-USUARIO/DentalSanFelipeProject/issues)
- 💼 LinkedIn: [Tu perfil]

---

## 🎉 ¡Listo para Usar!

Ahora tienes un sistema completo de gestión dental con notificaciones automáticas por WhatsApp. 

### 🔑 Primer Acceso

- **URL**: `http://localhost:4200`
- **Usuario**: `admin`
- **Contraseña**: `Admin123!`

> ⚠️ **IMPORTANTE**: Cambia la contraseña del administrador después del primer acceso

### ✅ Verificación Post-Instalación

```bash
# 1. Verificar que todos los contenedores estén corriendo
docker-compose ps

# 2. Verificar logs sin errores
docker-compose logs backend | grep -i error
docker-compose logs frontend | grep -i error

# 3. Probar endpoint de salud
curl http://localhost:3000/api/health

# 4. Acceder a la aplicación
# Abre http://localhost:4200 en tu navegador
```

### 🚀 Próximos Pasos

1. **Crear usuarios**: Agrega odontólogos y auxiliares desde el panel de administración
2. **Registrar pacientes**: Comienza a cargar información de pacientes
3. **Activar WhatsApp**: Sigue [ACTIVAR_WHATSAPP.md](./ACTIVAR_WHATSAPP.md) para notificaciones reales
4. **Personalizar**: Ajusta el `.env` según tus necesidades

---

## 📄 Licencia

Este proyecto está licenciado bajo la [Licencia MIT](LICENSE) - ver el archivo LICENSE para más detalles.

---

<div align="center">

**Hecho con ❤️ para mejorar la gestión de clínicas dentales**

⭐ Si te gusta este proyecto, dale una estrella en GitHub

</div>
