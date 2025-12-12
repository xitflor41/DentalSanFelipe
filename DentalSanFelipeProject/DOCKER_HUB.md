# Publicar en Docker Hub

## Pasos para Subir las Imágenes

### 1. Iniciar sesión en Docker Hub

```bash
docker login
# Ingresa tu usuario y contraseña de Docker Hub
```

### 2. Construir las imágenes

```bash
# Construir backend
cd dentalSanFelipe-backend
docker build -t tu-usuario/dental-backend:latest .
docker build -t tu-usuario/dental-backend:1.0.0 .

# Construir frontend
cd ../dentalSanFelipe-frontend
docker build -t tu-usuario/dental-frontend:latest .
docker build -t tu-usuario/dental-frontend:1.0.0 .
```

### 3. Subir a Docker Hub

```bash
# Subir backend
docker push tu-usuario/dental-backend:latest
docker push tu-usuario/dental-backend:1.0.0

# Subir frontend
docker push tu-usuario/dental-frontend:latest
docker push tu-usuario/dental-frontend:1.0.0
```

### 4. Actualizar docker-compose.yml

Reemplaza las secciones `build:` por `image:`:

```yaml
services:
  backend:
    image: tu-usuario/dental-backend:latest
    # ... resto de la configuración

  frontend:
    image: tu-usuario/dental-frontend:latest
    # ... resto de la configuración
```

## Uso desde Docker Hub

Los usuarios podrán instalar con:

```bash
# Clonar el repo (solo necesita docker-compose.yml y .env)
git clone https://github.com/tu-usuario/dental-sanfelipe.git
cd dental-sanfelipe

# O descargar solo estos archivos:
# - docker-compose.yml
# - .env.example

# Copiar configuración
cp .env.example .env

# Iniciar (descargará automáticamente las imágenes)
docker-compose up -d
```

## Script Completo de Publicación

```bash
#!/bin/bash

# Configuración
DOCKER_USER="tu-usuario"
VERSION="1.0.0"

# Login
echo "🔐 Iniciando sesión en Docker Hub..."
docker login

# Backend
echo "🔨 Construyendo backend..."
cd dentalSanFelipe-backend
docker build -t $DOCKER_USER/dental-backend:latest .
docker build -t $DOCKER_USER/dental-backend:$VERSION .

echo "⬆️  Subiendo backend..."
docker push $DOCKER_USER/dental-backend:latest
docker push $DOCKER_USER/dental-backend:$VERSION

# Frontend
echo "🔨 Construyendo frontend..."
cd ../dentalSanFelipe-frontend
docker build -t $DOCKER_USER/dental-frontend:latest .
docker build -t $DOCKER_USER/dental-frontend:$VERSION .

echo "⬆️  Subiendo frontend..."
docker push $DOCKER_USER/dental-frontend:latest
docker push $DOCKER_USER/dental-frontend:$VERSION

echo "✅ ¡Imágenes publicadas exitosamente!"
echo ""
echo "📦 Imágenes disponibles:"
echo "   docker pull $DOCKER_USER/dental-backend:latest"
echo "   docker pull $DOCKER_USER/dental-frontend:latest"
```

Guarda esto como `publish.sh`, dale permisos de ejecución y ejecútalo:

```bash
chmod +x publish.sh
./publish.sh
```

## Verificar Publicación

```bash
# Buscar tus imágenes
docker search tu-usuario/dental

# Probar descarga
docker pull tu-usuario/dental-backend:latest
docker pull tu-usuario/dental-frontend:latest
```

## README de Docker Hub

Copia este texto en la descripción de Docker Hub:

```markdown
# 🦷 Dental San Felipe

Sistema completo de gestión para clínicas dentales.

## Instalación Rápida

```bash
# 1. Crear docker-compose.yml con la configuración
wget https://raw.githubusercontent.com/tu-usuario/dental-sanfelipe/main/docker-compose.yml

# 2. Crear .env
wget https://raw.githubusercontent.com/tu-usuario/dental-sanfelipe/main/.env.example -O .env

# 3. Iniciar
docker-compose up -d
```

## Acceso

- Frontend: http://localhost:4200
- Backend: http://localhost:3000
- Usuario: admin / Admin123!

## Documentación

https://github.com/tu-usuario/dental-sanfelipe

## Tags Disponibles

- `latest` - Última versión estable
- `1.0.0` - Versión específica
```
