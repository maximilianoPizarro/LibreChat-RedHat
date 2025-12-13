# Script para limpiar y reconstruir el proyecto
# Uso: .\scripts\clean-and-rebuild.ps1

Write-Host "🧹 Limpiando proyecto..." -ForegroundColor Cyan

# Limpiar node_modules y package-lock.json (opcional, descomentar si es necesario)
# Write-Host "Eliminando node_modules..." -ForegroundColor Yellow
# Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
# Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue

# Limpiar caché de npm
Write-Host "Limpiando caché de npm..." -ForegroundColor Yellow
npm cache clean --force

# Limpiar dependencias no utilizadas (prune)
Write-Host "Ejecutando npm prune..." -ForegroundColor Yellow
npm prune

# Limpiar builds anteriores
Write-Host "Limpiando builds anteriores..." -ForegroundColor Yellow
Remove-Item -Recurse -Force client\dist -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force packages\client\dist -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force packages\data-provider\dist -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force packages\data-schemas\dist -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force packages\api\dist -ErrorAction SilentlyContinue

# Reinstalar dependencias (si se eliminaron node_modules)
# Write-Host "Instalando dependencias..." -ForegroundColor Yellow
# npm install

# Reconstruir cliente
Write-Host "`n🔨 Reconstruyendo cliente..." -ForegroundColor Cyan
npm run build:client

Write-Host "`n✅ Limpieza y reconstrucción completadas!" -ForegroundColor Green

