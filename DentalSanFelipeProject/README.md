# 🦷 Sistema de Gestión Dental San Felipe

Sistema completo de gestión para clínicas dentales con Angular, Node.js y MySQL.

![Node](https://img.shields.io/badge/node-20.x-green.svg)
![Angular](https://img.shields.io/badge/angular-20.3-red.svg)
![MySQL](https://img.shields.io/badge/mysql-8.0-blue.svg)

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación desde Cero](#-instalación-desde-cero)
- [Configuración de la Base de Datos](#-configuración-de-la-base-de-datos)
- [Configuración del Sistema](#️-configuración-del-sistema)
- [Ejecutar el Sistema](#-ejecutar-el-sistema)
- [Primer Acceso](#-primer-acceso)
- [Notificaciones WhatsApp](#-notificaciones-whatsapp-opcional)
- [Permisos por Rol](#️-permisos-por-rol)
- [Solución de Problemas](#-solución-de-problemas)

---

## ✨ Características

- ✅ **Gestión de Pacientes**: Registro completo con historial clínico
- ✅ **Sistema de Citas**: Programación y seguimiento de citas
- ✅ **Control de Acceso**: 3 roles (Administrador, Odontólogo, Auxiliar)
- ✅ **Expedientes Clínicos**: Historial médico, odontogramas, consultas
- ✅ **Tratamientos**: Registro de procedimientos y medicamentos
- ✅ **Notificaciones WhatsApp**: Confirmación automática de citas (opcional)
- ✅ **Seguridad**: Autenticación JWT, permisos granulares por rol
- ✅ **Auditoría**: Registro de todas las operaciones clínicas

---

## 📦 Requisitos Previos

Antes de comenzar, necesitas tener instalado en tu computadora:

### 1. Node.js (v20 o superior)

**Descargar**: https://nodejs.org/

Verifica la instalación abriendo una terminal:
```bash
node --version
npm --version
```

Deberías ver algo como:
```
v20.x.x
10.x.x
```

### 2. Git

**Descargar**: https://git-scm.com/downloads

Verifica la instalación:
```bash
git --version
```

### 3. MySQL 8.0

Elige **UNA** de estas opciones:

#### Opción A: MySQL con Docker (Recomendado) ⭐

**Requisito**: Docker Desktop instalado  
**Descargar**: https://www.docker.com/products/docker-desktop

**Ventajas**:
- ✅ Instalación rápida y limpia
- ✅ No afecta otras instalaciones de MySQL
- ✅ Fácil de eliminar completamente
- ✅ Mismo entorno en todas las máquinas

#### Opción B: XAMPP

**Descargar**: https://www.apachefriends.org/

**Ventajas**:
- ✅ Incluye MySQL y phpMyAdmin
- ✅ Interfaz gráfica fácil de usar
- ✅ Todo en uno
- ✅ Ideal para desarrollo local

#### Opción C: MySQL Instalación Nativa

**Descargar**: https://dev.mysql.com/downloads/installer/

**Ventajas**:
- ✅ Instalación completa de MySQL
- ✅ Control total del servidor
- ✅ Mejor para servidores de producción

---

## 🚀 Instalación desde Cero

### Paso 1: Descargar el Proyecto

Abre una terminal (PowerShell, CMD, o Terminal) y ejecuta:

```bash
# Clonar el repositorio
git clone https://github.com/TU-USUARIO/DentalSanFelipeProject.git

# Entrar a la carpeta
cd DentalSanFelipeProject
```

> **Nota**: Reemplaza `TU-USUARIO` con tu nombre de usuario de GitHub

### Paso 2: Instalar Dependencias del Backend

```bash
cd dentalSanFelipe-backend
npm install
```

Verás muchos paquetes instalándose. Espera a que termine (puede tardar 1-2 minutos).

```bash
cd ..
```

### Paso 3: Instalar Dependencias del Frontend

```bash
cd dentalSanFelipe-frontend
npm install
```

También tomará 1-2 minutos.

```bash
cd ..
```

---

## 🗄️ Configuración de la Base de Datos

Elige la opción que instalaste en los requisitos previos:

<details>
<summary><b>Opción A: MySQL con Docker (Click para expandir)</b></summary>

### Paso 1: Crear contenedor de MySQL

Abre una terminal y ejecuta:

**Windows (PowerShell/CMD):**
```bash
docker run --name dental-mysql -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=dental_sanfelipe -p 3306:3306 -d mysql:8.0
```

**Linux/Mac:**
```bash
docker run --name dental-mysql \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=dental_sanfelipe \
  -p 3306:3306 \
  -d mysql:8.0
```

### Paso 2: Esperar que MySQL inicie

MySQL tarda aproximadamente 30 segundos en estar listo. Verifica que está corriendo:

```bash
docker ps
```

Deberías ver:
```
CONTAINER ID   IMAGE       STATUS          PORTS                    NAMES
xxxxxxxxxx     mysql:8.0   Up 30 seconds   0.0.0.0:3306->3306/tcp   dental-mysql
```

### Paso 3: Importar la base de datos

```bash
# Copiar el archivo SQL al contenedor
docker cp dentalSanFelipe-backend/src/db/dental_sanfelipe.sql dental-mysql:/dental_sanfelipe.sql

# Importar la base de datos
docker exec -i dental-mysql mysql -uroot -proot dental_sanfelipe < dentalSanFelipe-backend/src/db/dental_sanfelipe.sql
```

Si no da errores, ¡la base de datos está lista! ✅

### Comandos útiles de Docker

```bash
# Iniciar MySQL (si está detenido)
docker start dental-mysql

# Detener MySQL
docker stop dental-mysql

# Ver logs de MySQL
docker logs dental-mysql

# Acceder a MySQL desde terminal
docker exec -it dental-mysql mysql -uroot -proot dental_sanfelipe

# Eliminar contenedor (¡cuidado! elimina todos los datos)
docker stop dental-mysql
docker rm dental-mysql
```

### Configuración del Backend

El `.env` ya viene configurado para Docker con:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=root
DB_NAME=dental_sanfelipe
```

</details>

<details>
<summary><b>Opción B: MySQL con XAMPP (Click para expandir)</b></summary>

### Paso 1: Iniciar XAMPP

1. Abre **XAMPP Control Panel**
2. Click en **Start** junto a **MySQL**
3. Espera a que se ponga en verde
4. Click en **Admin** (abre phpMyAdmin en el navegador)

### Paso 2: Crear la base de datos

En phpMyAdmin:

1. Click en **Nueva** (o **New**) en el panel izquierdo
2. Nombre de base de datos: `dental_sanfelipe`
3. Cotejamiento: `utf8mb4_general_ci`
4. Click en **Crear**

### Paso 3: Importar la estructura

1. Selecciona la base de datos `dental_sanfelipe` en el panel izquierdo
2. Click en la pestaña **Importar** (o **Import**)
3. Click en **Seleccionar archivo**
4. Navega a: `DentalSanFelipeProject/dentalSanFelipe-backend/src/db/dental_sanfelipe.sql`
5. Click en **Continuar** (o **Go**)
6. Espera a ver: **Importación finalizada exitosamente**

### Paso 4: Configurar el Backend

Edita el archivo `dentalSanFelipe-backend/.env`:

**Cambiar:**
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=root              # ← CAMBIAR A VACÍO
DB_NAME=dental_sanfelipe
```

**A:**
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=                  # ← SIN CONTRASEÑA (vacío)
DB_NAME=dental_sanfelipe
```

> **Nota**: XAMPP por defecto no tiene contraseña para root

</details>

<details>
<summary><b>Opción C: MySQL Instalación Nativa (Click para expandir)</b></summary>

### Paso 1: Crear la base de datos

Abre una terminal y conéctate a MySQL:

```bash
mysql -u root -p
```

Te pedirá la contraseña que configuraste durante la instalación.

Dentro de MySQL, ejecuta:

```sql
CREATE DATABASE dental_sanfelipe CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
exit;
```

### Paso 2: Importar la estructura

```bash
mysql -u root -p dental_sanfelipe < dentalSanFelipe-backend/src/db/dental_sanfelipe.sql
```

Te pedirá la contraseña nuevamente. Si no da errores, ¡listo! ✅

### Paso 3: Configurar el Backend

Edita el archivo `dentalSanFelipe-backend/.env` y actualiza la contraseña:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=TU_CONTRASEÑA_AQUI    # ← Tu contraseña de MySQL
DB_NAME=dental_sanfelipe
```

</details>

---

## ⚙️ Configuración del Sistema

### Paso 1: Configurar el Backend

Si aún no existe, crea el archivo `.env` desde el ejemplo:

**Windows (PowerShell/CMD):**
```bash
cd dentalSanFelipe-backend
copy .env.example .env
cd ..
```

**Linux/Mac:**
```bash
cd dentalSanFelipe-backend
cp .env.example .env
cd ..
```

### Paso 2: Revisar/Editar `.env`

Abre el archivo `dentalSanFelipe-backend/.env` con un editor de texto (Notepad, VSCode, etc.)

**Configuración mínima necesaria:**

```env
# ==========================================
# SERVIDOR
# ==========================================
PORT=3000
NODE_ENV=development

# ==========================================
# BASE DE DATOS
# ==========================================
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=root              # Ajusta según tu instalación
DB_NAME=dental_sanfelipe

# ==========================================
# SEGURIDAD JWT
# ==========================================
JWT_SECRET=tu_clave_secreta_jwt_muy_segura_cambiala_en_produccion
JWT_REFRESH_SECRET=tu_clave_secreta_refresh_jwt_muy_segura

# Duración de sesión: 15m, 30m, 1h, 2h, 8h, 12h, 24h
JWT_EXPIRES_IN=8h
JWT_REFRESH_EXPIRES_IN=7d

# ==========================================
# CONTRASEÑA ADMIN INICIAL
# ==========================================
SEED_ADMIN_PASS=Admin123!

# ==========================================
# WHATSAPP (Opcional - por ahora déjalo así)
# ==========================================
WHATSAPP_ENABLED=false
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# ==========================================
# FRONTEND
# ==========================================
FRONTEND_URL=http://localhost:4200
```

> **Importante**: Si usas XAMPP, `DB_PASS` debe estar vacío

### Paso 3: Crear el Usuario Administrador

```bash
cd dentalSanFelipe-backend
node src/db/seed-admin.js
```

Deberías ver:
```
✅ Usuario administrador creado exitosamente
Usuario: admin
Contraseña: Admin123!
Rol: administrador
```

```bash
cd ..
```

---

## ▶️ Ejecutar el Sistema

Necesitas **2 terminales abiertas** (o 2 pestañas de terminal):

### Terminal 1: Iniciar el Backend

```bash
cd dentalSanFelipe-backend
npm start
```

**Salida correcta:**
```
[dotenv@17.2.3] injecting env (21) from .env
[WhatsApp] ℹ️ Twilio no configurado (usando credenciales de ejemplo)
[WhatsApp] ℹ️ Para activar WhatsApp real, consulta ACTIVAR_WHATSAPP.md
Servidor ejecutándose en http://localhost:3000
```

> ⚠️ **No cierres esta terminal**, deja el backend corriendo

### Terminal 2: Iniciar el Frontend

Abre **otra terminal nueva** y ejecuta:

```bash
cd dentalSanFelipe-frontend
npm start
```

**Salida correcta:**
```
✔ Browser application bundle generation complete.

Initial Chunk Files   | Names         |  Raw Size
main.js               | main          | 2.50 MB   

** Angular Live Development Server is listening on localhost:4200 **
✔ Compiled successfully.
```

> ⚠️ **No cierres esta terminal**, deja el frontend corriendo

---

## 🔑 Primer Acceso

### Paso 1: Abrir la Aplicación

Abre tu navegador (Chrome, Firefox, Edge, etc.) en:

**http://localhost:4200**

Verás la página de login del sistema.

### Paso 2: Iniciar Sesión

Usa las credenciales por defecto:

- **Usuario**: `admin`
- **Contraseña**: `Admin123!`

Click en **Iniciar Sesión**

### Paso 3: ⚠️ IMPORTANTE - Cambiar Contraseña

Después del primer acceso, **debes cambiar la contraseña**:

1. Ve a **Usuarios** en el menú lateral
2. Busca el usuario `admin`
3. Click en **Editar**
4. Cambia la contraseña por una segura
5. Guarda los cambios

### Paso 4: Crear Usuarios Adicionales

Como administrador, puedes crear usuarios:

1. Ve a **Usuarios** → **Crear Nuevo Usuario**
2. Completa los datos:
   - **Nombre y Apellido**
   - **Correo electrónico**
   - **Usuario** (para login)
   - **Contraseña**
   - **Rol**:
     - **Administrador**: Acceso completo al sistema
     - **Odontólogo**: Puede atender pacientes, crear expedientes y tratamientos
     - **Auxiliar**: Puede ver información y agendar citas
3. Click en **Guardar**

---

## 📱 Notificaciones WhatsApp (Opcional)

Si deseas activar notificaciones automáticas cuando se crea una cita:

<details>
<summary><b>Configuración de WhatsApp con Twilio (Click para expandir)</b></summary>

### Paso 1: Crear Cuenta en Twilio

1. Ve a: https://www.twilio.com/
2. Click en **Sign Up** (Registrarse)
3. Completa el formulario
4. **Verifica tu número de teléfono**

### Paso 2: Obtener Credenciales

Una vez en el dashboard de Twilio:

1. Busca **Account SID** (empieza con `AC...`)
2. Busca **Auth Token** (32 caracteres)
3. Ve a **Messaging** → **Try it Out** → **Send a WhatsApp message**
4. Copia el **WhatsApp Sandbox Number** (formato: `whatsapp:+14155238886`)

### Paso 3: Configurar tu Número de WhatsApp

1. En Twilio, ve a la sección de WhatsApp Sandbox
2. Envía el código que te dan a su número de WhatsApp
3. Espera la confirmación

### Paso 4: Configurar en el Sistema

Edita `dentalSanFelipe-backend/.env`:

```env
WHATSAPP_ENABLED=true
TWILIO_ACCOUNT_SID=AC123456789abcdef...  # Tu Account SID real
TWILIO_AUTH_TOKEN=tu_auth_token_real     # Tu Auth Token real
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886  # El número que te dieron
```

### Paso 5: Reiniciar el Backend

En la terminal del backend, presiona `Ctrl + C` y luego:

```bash
npm start
```

Ahora deberías ver:
```
[WhatsApp] ✅ Cliente Twilio inicializado correctamente
```

### Paso 6: Probar

1. Crea una cita para un paciente
2. El paciente debería recibir un mensaje de WhatsApp con:
   - Fecha y hora de la cita
   - Nombre del dentista
   - Motivo de la consulta

</details>

---

## 🛡️ Permisos por Rol

El sistema tiene control de acceso granular basado en roles:

| Funcionalidad | Administrador | Odontólogo | Auxiliar |
|---------------|:-------------:|:----------:|:--------:|
| **Pacientes** |
| Ver pacientes | ✅ Todos | ✅ Solo asignados | ✅ Solo asignados |
| Crear pacientes | ✅ | ✅ Auto-asigna | ✅ |
| Editar pacientes | ✅ Todos | ✅ Solo asignados | ❌ |
| Eliminar pacientes | ✅ | ❌ | ❌ |
| **Expedientes** |
| Ver expedientes | ✅ Todos | ✅ De sus pacientes | ✅ De sus pacientes |
| Crear expedientes | ✅ | ✅ | ✅ |
| Editar expedientes | ✅ Todos | ✅ De sus pacientes | ❌ |
| **Historia Clínica** |
| Ver historia | ✅ Todas | ✅ De sus pacientes | ✅ De sus pacientes |
| Crear/editar historia | ✅ | ✅ De sus pacientes | ✅ De sus pacientes |
| **Tratamientos** |
| Ver tratamientos | ✅ Todos | ✅ De sus pacientes | ✅ De sus pacientes |
| Crear tratamientos | ✅ | ✅ De sus pacientes | ❌ |
| Editar tratamientos | ✅ Todos | ✅ De sus pacientes | ❌ |
| Eliminar tratamientos | ✅ | ✅ De sus pacientes | ❌ |
| **Citas** |
| Ver citas | ✅ Todas | ✅ De sus pacientes | ✅ De sus pacientes |
| Crear citas | ✅ | ✅ | ✅ |
| **Usuarios** |
| Gestionar usuarios | ✅ | ❌ | ❌ |
| **Procedimientos** |
| Gestionar procedimientos | ✅ | ❌ | ❌ |

**Nota**: Los pacientes se asignan a un odontólogo. Solo ese odontólogo (y los administradores) pueden ver/editar toda la información del paciente.

---

## 🔧 Solución de Problemas

### ❌ Error: "Cannot connect to MySQL"

**Síntomas**: Backend no inicia, muestra error de conexión a la base de datos

**Solución**:

1. **Verifica que MySQL esté corriendo:**

   - **Docker**: 
     ```bash
     docker ps
     ```
     Debe aparecer `dental-mysql` con estado `Up`
   
   - **XAMPP**: 
     Abre XAMPP Control Panel, MySQL debe estar en verde
   
   - **Instalación nativa**: 
     Busca "Services" en Windows o verifica que el servicio MySQL esté activo

2. **Verifica las credenciales en `.env`:**
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASS=tu_password  # Verifica que sea correcto
   ```

3. **Prueba la conexión manualmente:**
   
   - **Docker**:
     ```bash
     docker exec -it dental-mysql mysql -uroot -proot
     ```
   
   - **XAMPP/Nativo**:
     ```bash
     mysql -u root -p
     ```

4. **Si Docker no inicia MySQL:**
   ```bash
   docker logs dental-mysql
   ```
   Revisa los logs para ver qué está fallando

---

### ❌ Error: "Port 3000 already in use"

**Síntomas**: Backend no puede iniciar porque el puerto está ocupado

**Solución**:

**Opción 1**: Cambia el puerto en `.env`
```env
PORT=3001  # O cualquier puerto libre
```

**Opción 2**: Detén el proceso que usa el puerto 3000

Windows:
```bash
netstat -ano | findstr :3000
taskkill /PID <número_del_PID> /F
```

Linux/Mac:
```bash
lsof -ti:3000 | xargs kill
```

---

### ❌ Error: "Port 4200 already in use"

**Síntomas**: Frontend no puede iniciar

**Solución**:

1. Detén todos los procesos de Angular:
   
   **Windows:**
   ```bash
   taskkill /F /IM node.exe /T
   ```
   
   **Linux/Mac:**
   ```bash
   killall node
   ```

2. Vuelve a iniciar el frontend:
   ```bash
   npm start
   ```

---

### ❌ Error: "Module not found" o "Cannot find module"

**Síntomas**: Errores al iniciar backend o frontend

**Solución**:

Las dependencias no están instaladas correctamente.

**Backend:**
```bash
cd dentalSanFelipe-backend
rm -rf node_modules package-lock.json  # Eliminar todo
npm install                              # Reinstalar
```

**Frontend:**
```bash
cd dentalSanFelipe-frontend
rm -rf node_modules package-lock.json  # Eliminar todo
npm install                              # Reinstalar
```

---

### ❌ Página en blanco o "Cannot GET /"

**Síntomas**: El navegador muestra página en blanco en http://localhost:4200

**Solución**:

1. Verifica que el frontend esté compilando:
   ```bash
   cd dentalSanFelipe-frontend
   npm start
   ```

2. Espera a ver: `✔ Compiled successfully.`

3. Si sigue sin funcionar, limpia caché:
   ```bash
   Ctrl + C  # Detener
   npm install
   npm start
   ```

---

### ❌ "Credenciales inválidas" al hacer login

**Síntomas**: No puedes iniciar sesión con admin/Admin123!

**Solución**:

El usuario admin no fue creado o hay problema en la BD.

1. Recrea el usuario admin:
   ```bash
   cd dentalSanFelipe-backend
   node src/db/seed-admin.js
   ```

2. Verifica que la base de datos tenga datos:
   
   **Docker:**
   ```bash
   docker exec -it dental-mysql mysql -uroot -proot
   USE dental_sanfelipe;
   SELECT * FROM usuarios;
   ```
   
   Debe aparecer el usuario `admin`

---

### ❌ WhatsApp no envía mensajes

**Síntomas**: Las citas se crean pero no llegan mensajes

**Solución**:

1. Verifica en `.env` que esté habilitado:
   ```env
   WHATSAPP_ENABLED=true
   ```

2. Verifica las credenciales:
   ```env
   TWILIO_ACCOUNT_SID=ACxxxxxxxx...  # Debe empezar con AC
   TWILIO_AUTH_TOKEN=xxxxxxxx...     # 32 caracteres
   ```

3. Revisa los logs del backend:
   
   Si ves:
   ```
   [WhatsApp] ℹ️ Twilio no configurado
   ```
   
   Las credenciales son inválidas.

4. Si está en modo simulado, los mensajes aparecen en la consola del backend:
   ```
   [WhatsApp] 📱 Mensaje simulado (WHATSAPP_ENABLED=false):
   Para: 5551234567
   Mensaje: Hola Juan, tu cita está confirmada...
   ```

---

### ❌ "Session expired" muy rápido

**Síntomas**: Te saca del sistema cada pocos minutos

**Solución**:

El tiempo de sesión es muy corto.

Edita `.env`:
```env
JWT_EXPIRES_IN=8h  # 8 horas (día laboral completo)
```

Opciones:
- `15m` = 15 minutos (muy seguro, poco práctico)
- `1h` = 1 hora
- `2h` = 2 horas
- `8h` = 8 horas (recomendado)
- `24h` = 24 horas

Reinicia el backend después de cambiar.

---

### ❌ No puedo ver pacientes siendo odontólogo/auxiliar

**Síntomas**: Lista de pacientes vacía, pero como admin sí se ven

**Solución**:

Los pacientes no están asignados al odontólogo.

1. Inicia sesión como **administrador**
2. Ve a **Pacientes**
3. Para cada paciente, click en **Editar**
4. Selecciona el **Odontólogo Asignado**
5. Guarda los cambios

Ahora ese odontólogo podrá ver esos pacientes.

---

### ❌ Error al importar la base de datos

**Síntomas**: Errores SQL al importar `dental_sanfelipe.sql`

**Solución**:

1. Verifica que la base de datos esté vacía:
   ```sql
   DROP DATABASE IF EXISTS dental_sanfelipe;
   CREATE DATABASE dental_sanfelipe CHARACTER SET utf8mb4;
   ```

2. Importa nuevamente:
   
   **Docker:**
   ```bash
   docker exec -i dental-mysql mysql -uroot -proot dental_sanfelipe < dentalSanFelipe-backend/src/db/dental_sanfelipe.sql
   ```
   
   **XAMPP/Nativo:**
   ```bash
   mysql -u root -p dental_sanfelipe < dentalSanFelipe-backend/src/db/dental_sanfelipe.sql
   ```

---

## 📊 Estructura del Proyecto

```
DentalSanFelipeProject/
├── dentalSanFelipe-backend/      # API REST (Node.js + Express)
│   ├── src/
│   │   ├── controllers/          # Lógica de negocio
│   │   ├── routes/               # Definición de endpoints
│   │   ├── services/             # WhatsApp, notificaciones
│   │   ├── middlewares/          # Autenticación, validación
│   │   ├── config/               # Configuración (DB, env)
│   │   └── db/                   # SQL y scripts
│   ├── scripts/                  # Scripts utilitarios
│   ├── .env                      # Configuración (crear desde .env.example)
│   ├── .env.example              # Plantilla de configuración
│   ├── package.json              # Dependencias del backend
│   └── server.js                 # Punto de entrada
│
├── dentalSanFelipe-frontend/     # Aplicación Angular
│   ├── src/
│   │   ├── app/
│   │   │   ├── pages/            # Páginas del sistema
│   │   │   ├── core/             # Services, guards, interceptors
│   │   │   └── components/       # Componentes reutilizables
│   │   ├── index.html            # HTML principal
│   │   └── styles.css            # Estilos globales
│   ├── angular.json              # Configuración de Angular
│   ├── package.json              # Dependencias del frontend
│   └── tsconfig.json             # Configuración TypeScript
│
├── README.md                     # Este archivo
├── CONFIGURACION_SESIONES.md     # Guía de configuración de sesiones
└── .gitignore                    # Archivos ignorados por Git
```

---

## 🔄 Actualizar el Sistema

Si descargas una versión más nueva del sistema:

### Paso 1: Descargar Cambios

```bash
# Guardar tus cambios locales (si los hay)
git stash

# Obtener la última versión
git pull origin main

# Restaurar tus cambios
git stash pop
```

### Paso 2: Actualizar Dependencias

```bash
# Backend
cd dentalSanFelipe-backend
npm install
cd ..

# Frontend
cd dentalSanFelipe-frontend
npm install
cd ..
```

### Paso 3: Actualizar Base de Datos (si hay cambios)

Revisa si hay nuevos archivos SQL en `dentalSanFelipe-backend/src/db/` y ejecútalos.

### Paso 4: Reiniciar Servicios

- Backend: `Ctrl + C` y luego `npm start`
- Frontend: `Ctrl + C` y luego `npm start`

---

## 💾 Backup de la Base de Datos

### Exportar (Backup)

**Docker:**
```bash
docker exec dental-mysql mysqldump -uroot -proot dental_sanfelipe > backup_$(date +%Y%m%d).sql
```

**XAMPP/Nativo:**
```bash
mysqldump -u root -p dental_sanfelipe > backup_20241212.sql
```

### Importar (Restaurar)

**Docker:**
```bash
docker exec -i dental-mysql mysql -uroot -proot dental_sanfelipe < backup_20241212.sql
```

**XAMPP/Nativo:**
```bash
mysql -u root -p dental_sanfelipe < backup_20241212.sql
```

---

## 📞 Soporte y Contribución

### 📚 Documentación Adicional

- `CONFIGURACION_SESIONES.md` - Cómo ajustar la duración de las sesiones
- `.env.example` - Todas las variables de configuración disponibles

### 🐛 Reportar Problemas

Si encuentras un error:

1. Revisa la sección [Solución de Problemas](#-solución-de-problemas)
2. Abre un issue en GitHub incluyendo:
   - Descripción detallada del problema
   - Pasos para reproducirlo
   - Logs del backend/frontend (copiar de la terminal)
   - Sistema operativo y versiones

### 🤝 Contribuir al Proyecto

¿Quieres mejorar el sistema?

1. Haz Fork del repositorio
2. Crea una rama: `git checkout -b feature/nueva-funcionalidad`
3. Realiza tus cambios
4. Commit: `git commit -m 'Agrega nueva funcionalidad'`
5. Push: `git push origin feature/nueva-funcionalidad`
6. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

<div align="center">

**🦷 Sistema de Gestión Dental San Felipe**

Hecho con ❤️ para mejorar la gestión de clínicas dentales

---

⭐ Si este proyecto te es útil, dale una estrella en GitHub

[Reportar Bug](https://github.com/TU-USUARIO/DentalSanFelipeProject/issues) • [Solicitar Feature](https://github.com/TU-USUARIO/DentalSanFelipeProject/issues) • [Ver Documentación](https://github.com/TU-USUARIO/DentalSanFelipeProject)

</div>
