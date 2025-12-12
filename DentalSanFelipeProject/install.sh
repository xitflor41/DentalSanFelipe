#!/bin/bash

echo "========================================"
echo "  DENTAL SAN FELIPE - INSTALACION"
echo "========================================"
echo ""

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ ERROR: Node.js no esta instalado"
    echo "Descargalo desde: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js encontrado"
node --version

# Verificar Docker
if ! command -v docker &> /dev/null; then
    echo "❌ ERROR: Docker no esta instalado"
    echo "Descargalo desde: https://www.docker.com/products/docker-desktop"
    exit 1
fi

echo "✅ Docker encontrado"
docker --version
echo ""

# ==========================================
echo "PASO 1: Configurando Backend..."
# ==========================================
cd dentalSanFelipe-backend

# Instalar dependencias
echo "Instalando dependencias de Node.js..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ ERROR: Fallo al instalar dependencias del backend"
    exit 1
fi

# Copiar .env si no existe
if [ ! -f .env ]; then
    echo "Creando archivo .env desde .env.example..."
    cp .env.example .env
    echo ""
    echo "⚠️  IMPORTANTE: Edita dentalSanFelipe-backend/.env con tus configuraciones"
    echo "Presiona Enter cuando hayas terminado de editar .env"
    read -p ""
fi

# ==========================================
echo "PASO 2: Iniciando MySQL en Docker..."
# ==========================================
echo "Levantando contenedor MySQL..."
docker-compose up -d

echo "Esperando 15 segundos para que MySQL inicie completamente..."
sleep 15

# Verificar que el contenedor este corriendo
if ! docker ps | grep -q mysql_dentalsanfelipe; then
    echo "❌ ERROR: El contenedor MySQL no esta corriendo"
    echo "Ejecuta: docker-compose logs"
    exit 1
fi

echo "✅ MySQL corriendo en Docker"

# ==========================================
echo "PASO 3: Ejecutando migraciones..."
# ==========================================

# Copiar script de migracion
echo "Copiando script de migracion al contenedor..."
docker cp src/db/migrations/0001_complete_setup.sql mysql_dentalsanfelipe:/tmp/

# Ejecutar migracion
echo "Ejecutando migracion de base de datos..."
docker exec -i mysql_dentalsanfelipe mysql -uroot -proot dental_sanfelipe < src/db/migrations/0001_complete_setup.sql

if [ $? -ne 0 ]; then
    echo "⚠️  ADVERTENCIA: Hubo un problema con la migracion"
    echo "Esto puede ser normal si ya se ejecuto antes"
fi

# ==========================================
echo "PASO 4: Creando usuario administrador..."
# ==========================================
echo "Ejecutando seed de usuario admin..."
node src/db/seed-admin.js

# ==========================================
echo "PASO 5: Configurando Frontend..."
# ==========================================
cd ../dentalSanFelipe-frontend

echo "Instalando dependencias de Angular..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ ERROR: Fallo al instalar dependencias del frontend"
    exit 1
fi

cd ..

echo ""
echo "========================================"
echo "  INSTALACION COMPLETADA ✅"
echo "========================================"
echo ""
echo "CREDENCIALES DE ACCESO:"
echo "  Usuario: admin"
echo "  Password: Admin123!"
echo ""
echo "PARA INICIAR EL SISTEMA:"
echo ""
echo "1. Backend:"
echo "   cd dentalSanFelipe-backend"
echo "   node server.js"
echo ""
echo "2. Frontend (en otra terminal):"
echo "   cd dentalSanFelipe-frontend"
echo "   npm start"
echo ""
echo "3. Worker de Notificaciones (opcional, en otra terminal):"
echo "   cd dentalSanFelipe-backend"
echo "   node src/workers/notification.worker.js"
echo ""
echo "ACCESO:"
echo "  Frontend: http://localhost:4200"
echo "  Backend:  http://localhost:3000"
echo ""
echo "SIGUIENTE PASO:"
echo "  Para configurar WhatsApp, lee: dentalSanFelipe-backend/WHATSAPP_SETUP.md"
echo ""
