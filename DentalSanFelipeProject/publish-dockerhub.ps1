# Script para publicar en Docker Hub (Windows PowerShell)

param(
    [string]$DockerUser = "tu-usuario",
    [string]$Version = "1.0.0"
)

Write-Host "====================================" -ForegroundColor Cyan
Write-Host "  🦷 Dental San Felipe" -ForegroundColor White
Write-Host "  Publicar en Docker Hub" -ForegroundColor White
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Login
Write-Host "🔐 Iniciando sesión en Docker Hub..." -ForegroundColor Yellow
docker login
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al iniciar sesión" -ForegroundColor Red
    exit 1
}

# Backend
Write-Host ""
Write-Host "🔨 Construyendo backend..." -ForegroundColor Yellow
Set-Location dentalSanFelipe-backend

docker build -t "${DockerUser}/dental-backend:latest" .
docker build -t "${DockerUser}/dental-backend:${Version}" .

Write-Host "⬆️  Subiendo backend..." -ForegroundColor Yellow
docker push "${DockerUser}/dental-backend:latest"
docker push "${DockerUser}/dental-backend:${Version}"

# Frontend
Write-Host ""
Write-Host "🔨 Construyendo frontend..." -ForegroundColor Yellow
Set-Location ..\dentalSanFelipe-frontend

docker build -t "${DockerUser}/dental-frontend:latest" .
docker build -t "${DockerUser}/dental-frontend:${Version}" .

Write-Host "⬆️  Subiendo frontend..." -ForegroundColor Yellow
docker push "${DockerUser}/dental-frontend:latest"
docker push "${DockerUser}/dental-frontend:${Version}"

# Volver al directorio raíz
Set-Location ..

Write-Host ""
Write-Host "====================================" -ForegroundColor Green
Write-Host "  ✅ ¡Imágenes publicadas!" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green
Write-Host ""
Write-Host "📦 Imágenes disponibles:" -ForegroundColor Cyan
Write-Host "   docker pull ${DockerUser}/dental-backend:latest" -ForegroundColor White
Write-Host "   docker pull ${DockerUser}/dental-frontend:latest" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Ver en Docker Hub:" -ForegroundColor Cyan
Write-Host "   https://hub.docker.com/r/${DockerUser}/dental-backend" -ForegroundColor White
Write-Host "   https://hub.docker.com/r/${DockerUser}/dental-frontend" -ForegroundColor White
Write-Host ""
