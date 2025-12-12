@echo off
echo ========================================
echo   DENTAL SAN FELIPE - INSTALACION
echo ========================================
echo.

REM Verificar Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js no esta instalado
    echo Descargalo desde: https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js encontrado
node --version

REM Verificar Docker
where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Docker no esta instalado
    echo Descargalo desde: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo [OK] Docker encontrado
docker --version
echo.

REM ==========================================
echo PASO 1: Configurando Backend...
REM ==========================================
cd dentalSanFelipe-backend

REM Instalar dependencias
echo Instalando dependencias de Node.js...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Fallo al instalar dependencias del backend
    pause
    exit /b 1
)

REM Copiar .env si no existe
if not exist .env (
    echo Creando archivo .env desde .env.example...
    copy .env.example .env
    echo.
    echo IMPORTANTE: Edita dentalSanFelipe-backend\.env con tus configuraciones
    echo Presiona una tecla cuando hayas terminado de editar .env
    pause
)

REM ==========================================
echo PASO 2: Iniciando MySQL en Docker...
REM ==========================================
echo Levantando contenedor MySQL...
docker-compose up -d

echo Esperando 15 segundos para que MySQL inicie completamente...
timeout /t 15 /nobreak

REM Verificar que el contenedor este corriendo
docker ps | findstr mysql_dentalsanfelipe >nul
if %errorlevel% neq 0 (
    echo ERROR: El contenedor MySQL no esta corriendo
    echo Ejecuta: docker-compose logs
    pause
    exit /b 1
)

echo [OK] MySQL corriendo en Docker

REM ==========================================
echo PASO 3: Ejecutando migraciones...
REM ==========================================

REM Copiar script de migracion
echo Copiando script de migracion al contenedor...
docker cp src\db\migrations\0001_complete_setup.sql mysql_dentalsanfelipe:/tmp/

REM Ejecutar migracion
echo Ejecutando migracion de base de datos...
docker exec -i mysql_dentalsanfelipe mysql -uroot -proot dental_sanfelipe < src\db\migrations\0001_complete_setup.sql

if %errorlevel% neq 0 (
    echo ADVERTENCIA: Hubo un problema con la migracion
    echo Esto puede ser normal si ya se ejecuto antes
)

REM ==========================================
echo PASO 4: Creando usuario administrador...
REM ==========================================
echo Ejecutando seed de usuario admin...
node src\db\seed-admin.js

REM ==========================================
echo PASO 5: Configurando Frontend...
REM ==========================================
cd ..\dentalSanFelipe-frontend

echo Instalando dependencias de Angular...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Fallo al instalar dependencias del frontend
    pause
    exit /b 1
)

cd ..

echo.
echo ========================================
echo   INSTALACION COMPLETADA
echo ========================================
echo.
echo CREDENCIALES DE ACCESO:
echo   Usuario: admin
echo   Password: Admin123!
echo.
echo PARA INICIAR EL SISTEMA:
echo.
echo 1. Backend:
echo    cd dentalSanFelipe-backend
echo    node server.js
echo.
echo 2. Frontend (en otra terminal):
echo    cd dentalSanFelipe-frontend
echo    npm start
echo.
echo 3. Worker de Notificaciones (opcional, en otra terminal):
echo    cd dentalSanFelipe-backend
echo    node src\workers\notification.worker.js
echo.
echo ACCESO:
echo   Frontend: http://localhost:4200
echo   Backend:  http://localhost:3000
echo.
echo SIGUIENTE PASO:
echo   Para configurar WhatsApp, lee: dentalSanFelipe-backend\WHATSAPP_SETUP.md
echo.
pause
