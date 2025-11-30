# Script PowerShell para configurar automáticamente el archivo .env desde env.example.podman
# Se ejecuta antes de los comandos de podman compose

$envExamplePath = Join-Path $PSScriptRoot "..\env.example.podman"
$envPath = Join-Path $PSScriptRoot "..\.env"

# Resolver rutas absolutas
$envExamplePath = Resolve-Path $envExamplePath -ErrorAction SilentlyContinue
$envPath = $envPath | Resolve-Path -ErrorAction SilentlyContinue

# Si no se pudo resolver, usar ruta relativa
if (-not $envExamplePath) {
    $envExamplePath = Join-Path (Get-Location) "env.example.podman"
}
if (-not $envPath) {
    $envPath = Join-Path (Get-Location) ".env"
}

# Verificar si existe env.example.podman
if (-not (Test-Path $envExamplePath)) {
    Write-Host "❌ Error: No se encontró el archivo env.example.podman" -ForegroundColor Red
    Write-Host "   Buscado en: $envExamplePath" -ForegroundColor Yellow
    exit 1
}

# Si .env ya existe, no hacer nada
if (Test-Path $envPath) {
    Write-Host "✓ Archivo .env ya existe, no se modificará" -ForegroundColor Green
    exit 0
}

# Copiar env.example.podman a .env
try {
    Copy-Item -Path $envExamplePath -Destination $envPath -Force
    Write-Host "✓ Archivo .env creado automáticamente desde env.example.podman" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  IMPORTANTE: Edita el archivo .env y configura las siguientes variables:" -ForegroundColor Yellow
    Write-Host "   - MEILI_MASTER_KEY (genera una clave segura)" -ForegroundColor Yellow
    Write-Host "   - JWT_SECRET (genera una clave segura)" -ForegroundColor Yellow
    Write-Host "   - JWT_REFRESH_SECRET (genera una clave segura)" -ForegroundColor Yellow
    Write-Host "   - DOMAIN (ajusta según tu configuración)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   Puedes generar claves seguras en PowerShell con:" -ForegroundColor Cyan
    Write-Host "   -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]`$_})" -ForegroundColor Cyan
    Write-Host ""
    exit 0
} catch {
    Write-Host "❌ Error al crear el archivo .env: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

