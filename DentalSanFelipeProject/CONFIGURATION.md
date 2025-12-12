# 🚀 Guía de Configuración Completa

## 📋 Checklist de Configuración

### ✅ Paso 1: Verificar Instalación Base

```bash
# Verificar que Docker esté corriendo
docker ps | findstr mysql_dentalsanfelipe

# Verificar que Node.js esté instalado
node --version  # Debe ser v18 o superior

# Verificar que las dependencias estén instaladas
cd dentalSanFelipe-backend
npm list
```

---

### ✅ Paso 2: Configurar Base de Datos

#### Opción A: Usando Docker (Recomendado)

El archivo `docker-compose.yml` ya está configurado correctamente:

```yaml
version: "3.9"
services:
  mysql:
    image: mysql:8.0
    container_name: mysql_dentalsanfelipe
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: dental_sanfelipe
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./src/db/dental_sanfelipe.sql:/docker-entrypoint-initdb.d/dental_sanfelipe.sql
volumes:
  mysql_data:
```

**No necesitas cambiar nada si usas Docker con la configuración por defecto.**

Las credenciales en `.env` ya están correctas:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=root
DB_NAME=dental_sanfelipe
```

#### Opción B: Usando MySQL Local

Si tienes MySQL instalado localmente en lugar de Docker:

1. Crea la base de datos:
```sql
CREATE DATABASE dental_sanfelipe CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
```

2. Importa el esquema:
```bash
mysql -u root -p dental_sanfelipe < src/db/dental_sanfelipe.sql
```

3. Actualiza `.env`:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=tu_usuario_mysql
DB_PASS=tu_contraseña_mysql
DB_NAME=dental_sanfelipe
```

---

### ✅ Paso 3: Ejecutar Migraciones

```bash
cd dentalSanFelipe-backend

# Copiar script al contenedor
docker cp src/db/migrations/0001_complete_setup.sql mysql_dentalsanfelipe:/tmp/

# Ejecutar migración
docker exec -i mysql_dentalsanfelipe mysql -uroot -proot dental_sanfelipe < src/db/migrations/0001_complete_setup.sql

# O usar el script NPM
npm run migrate
```

**Qué hace esta migración:**
- Actualiza tabla `notificaciones` para WhatsApp
- Actualiza tabla `audit_expedientes` con campos flexibles
- Agrega campo `creado_por` a tabla `adjuntos`
- Crea índices para optimizar consultas
- Crea usuario administrador inicial
- Crea procedimientos de ejemplo
- Verifica integridad de datos

---

### ✅ Paso 4: Configurar Variables de Entorno

Edita el archivo `.env` en `dentalSanFelipe-backend/`:

#### Variables Obligatorias

```env
# Puerto del servidor
PORT=3000

# Base de datos (si usas Docker, no cambies)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=root
DB_NAME=dental_sanfelipe

# JWT Secrets (CAMBIAR EN PRODUCCIÓN)
JWT_SECRET=genera_un_secreto_seguro_aqui
JWT_REFRESH_SECRET=genera_otro_secreto_diferente_aqui

# Contraseña del admin inicial
SEED_ADMIN_PASS=Admin123!
```

**Generar secretos seguros:**

En PowerShell:
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### Variables de WhatsApp (Opcional para empezar)

```env
# Modo simulación (true = no envía mensajes reales)
WHATSAPP_SIMULATION_MODE=true

# Credenciales de Twilio (obtén en https://console.twilio.com/)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=tu_auth_token_aqui

# Número de WhatsApp de Twilio
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

**Puedes dejar WhatsApp en modo simulación hasta que tengas credenciales reales.**

---

### ✅ Paso 5: Crear Usuario Administrador

```bash
cd dentalSanFelipe-backend
node src/db/seed-admin.js

# O usar script NPM
npm run seed:admin
```

Credenciales creadas:
- **Usuario**: `admin`
- **Contraseña**: `Admin123!` (la del `.env`)
- **Rol**: Administrador

---

### ✅ Paso 6: Iniciar el Sistema

#### Terminal 1: Backend

```bash
cd dentalSanFelipe-backend
npm run dev
# o
node server.js
```

Deberías ver:
```
Servidor ejecutándose en http://localhost:3000
```

#### Terminal 2: Frontend

```bash
cd dentalSanFelipe-frontend
npm start
```

Deberías ver:
```
Angular Live Development Server is listening on localhost:4200
```

#### Terminal 3: Worker de Notificaciones (Opcional)

```bash
cd dentalSanFelipe-backend
npm run worker
# o
node src/workers/notification.worker.js
```

Deberías ver:
```
[WhatsApp Worker] 🚀 Iniciando worker de notificaciones WhatsApp...
[WhatsApp Worker] 📋 Modo: SIMULACIÓN
[WhatsApp Worker] ⏱️  Intervalo: 30 segundos
[WhatsApp Worker] 🔄 Reintentos máximos: 3
```

---

### ✅ Paso 7: Verificar que Todo Funcione

1. **Accede al frontend**: `http://localhost:4200`

2. **Inicia sesión**:
   - Usuario: `admin`
   - Contraseña: `Admin123!`

3. **Verifica el backend**:
   - API Health: `http://localhost:3000/api/health`
   - Debería responder: `{"status":"ok"}`

4. **Prueba crear un paciente**:
   - Ve a **Pacientes** → **Crear**
   - Rellena los datos
   - **Incluye número de teléfono**: `+52XXXXXXXXXX`
   - Guarda

5. **Prueba crear una cita**:
   - Ve a **Citas** → **Crear**
   - Selecciona el paciente
   - Programa una cita
   - Verifica en consola del worker que se creó la notificación

---

## 🔧 Configuración Avanzada

### Cambiar Puerto del Backend

En `.env`:
```env
PORT=5000
```

Actualiza también en los servicios del frontend:
```typescript
// src/app/core/services/*.service.ts
private readonly API_URL = 'http://localhost:5000/api';
```

### Configurar CORS para Producción

En `server.js`:
```javascript
app.use(cors({
  origin: ['http://localhost:4200', 'https://tudominio.com'],
  credentials: true
}));
```

### Cambiar Credenciales de MySQL

1. Actualiza `docker-compose.yml`:
```yaml
environment:
  MYSQL_ROOT_PASSWORD: mi_password_seguro
  MYSQL_DATABASE: dental_sanfelipe
```

2. Actualiza `.env`:
```env
DB_PASS=mi_password_seguro
```

3. Reinicia Docker:
```bash
docker-compose down -v
docker-compose up -d
```

---

## 📱 Configurar WhatsApp para Producción

### Paso 1: Crear Cuenta de Twilio

1. Ve a: https://www.twilio.com/try-twilio
2. Regístrate (obtienes $15 USD gratis)
3. Verifica tu número de teléfono

### Paso 2: Obtener Credenciales

1. Ve al Dashboard: https://console.twilio.com/
2. Copia:
   - **Account SID**: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - **Auth Token**: Click en "Show"

### Paso 3: Configurar Sandbox de WhatsApp

1. Ve a: **Messaging** → **Try it out** → **Send a WhatsApp message**
2. Verás un código: `join <palabra-clave>`
3. Desde tu WhatsApp:
   - Envía mensaje a: `+1 415 523 8886`
   - Escribe: `join tu-palabra-clave`
   - Espera confirmación

### Paso 4: Actualizar .env

```env
WHATSAPP_SIMULATION_MODE=false
TWILIO_ACCOUNT_SID=AC_tu_account_sid_real
TWILIO_AUTH_TOKEN=tu_auth_token_real
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

### Paso 5: Instalar Dependencia

```bash
npm install twilio
```

### Paso 6: Reiniciar Worker

```bash
# Detén el worker actual (Ctrl+C)
# Inicia nuevamente
npm run worker
```

Ahora verás:
```
[WhatsApp Worker] 📋 Modo: PRODUCCIÓN
```

### Paso 7: Probar Envío Real

1. Crea una cita en el sistema
2. Verifica que el paciente tenga teléfono
3. Para prueba inmediata, actualiza la fecha programada:

```sql
UPDATE notificaciones 
SET fecha_programada = NOW()
WHERE id_notificacion = (SELECT MAX(id_notificacion) FROM notificaciones);
```

4. En máximo 30 segundos, recibirás el mensaje en WhatsApp

---

## 🐛 Solución de Problemas Comunes

### Error: "Cannot connect to MySQL"

```bash
# Verificar que Docker esté corriendo
docker ps

# Reiniciar contenedor
docker-compose restart

# Ver logs
docker logs mysql_dentalsanfelipe
```

### Error: "Port 3306 already in use"

Tienes MySQL corriendo localmente. Opciones:

**Opción A**: Detén MySQL local:
```bash
# Windows (como admin)
net stop MySQL80

# Linux/Mac
sudo service mysql stop
```

**Opción B**: Cambia el puerto de Docker:
```yaml
# docker-compose.yml
ports:
  - "3307:3306"  # Cambia 3306 por 3307
```

Y en `.env`:
```env
DB_PORT=3307
```

### Error: "JWT Secret is not defined"

Verifica que `.env` tenga:
```env
JWT_SECRET=tu_secreto_aqui
JWT_REFRESH_SECRET=otro_secreto_aqui
```

### Worker no envía mensajes

1. **Verifica modo simulación**:
```env
WHATSAPP_SIMULATION_MODE=true  # = no envía reales
WHATSAPP_SIMULATION_MODE=false # = envía reales
```

2. **Verifica credenciales**:
   - TWILIO_ACCOUNT_SID debe empezar con `AC`
   - TWILIO_AUTH_TOKEN debe tener 32 caracteres

3. **Verifica logs del worker**:
   - Busca mensajes de error en la consola

### Frontend no puede hacer login

1. **Verifica que el backend esté corriendo**:
   - http://localhost:3000/api/health

2. **Verifica CORS**:
   - Abre consola del navegador (F12)
   - Busca errores de CORS

3. **Verifica credenciales**:
   - Usuario: `admin`
   - Contraseña: La que configuraste en `SEED_ADMIN_PASS`

---

## 📊 Comandos Útiles

### Base de Datos

```bash
# Conectar a MySQL
npm run db:connect
# o
docker exec -it mysql_dentalsanfelipe mysql -uroot -proot dental_sanfelipe

# Backup
npm run db:backup

# Ver todas las tablas
docker exec -it mysql_dentalsanfelipe mysql -uroot -proot -e "SHOW TABLES FROM dental_sanfelipe;"

# Ver notificaciones pendientes
docker exec -it mysql_dentalsanfelipe mysql -uroot -proot dental_sanfelipe -e "SELECT * FROM notificaciones WHERE enviado = FALSE;"
```

### Docker

```bash
# Iniciar
npm run docker:up

# Detener
npm run docker:down

# Ver logs
npm run docker:logs

# Reiniciar
npm run docker:restart

# Eliminar todo (CUIDADO: borra datos)
docker-compose down -v
```

### Desarrollo

```bash
# Backend con auto-reload
npm run dev

# Worker con auto-reload
npm run worker:dev

# Crear admin
npm run seed:admin

# Ejecutar migración
npm run migrate
```

---

## ✅ Checklist Final

Antes de pasar a producción:

- [ ] Cambiar `JWT_SECRET` y `JWT_REFRESH_SECRET`
- [ ] Cambiar contraseña de admin después del primer login
- [ ] Cambiar credenciales de MySQL
- [ ] Configurar HTTPS
- [ ] Configurar dominio propio
- [ ] Configurar backups automáticos
- [ ] Revisar permisos de archivos (`uploads/`)
- [ ] Configurar WhatsApp Business API (no sandbox)
- [ ] Configurar rate limiting
- [ ] Configurar logs en producción
- [ ] Hacer pruebas de carga
- [ ] Documentar procedimientos de backup/restore

---

## 📚 Documentación Adicional

- [README Principal](./README.md)
- [Configuración de WhatsApp](./dentalSanFelipe-backend/WHATSAPP_SETUP.md)
- [Documentación de Twilio](https://www.twilio.com/docs/whatsapp)
- [Documentación de Angular](https://angular.dev)
- [Documentación de Express](https://expressjs.com)

---

¿Listo? ¡Ahora tienes todo configurado! 🎉

**Siguiente paso**: `http://localhost:4200` → Login con `admin` / `Admin123!`
