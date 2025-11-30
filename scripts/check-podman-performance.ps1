# Script para verificar y optimizar configuración de Podman en Windows
# Ejecutar: .\scripts\check-podman-performance.ps1

Write-Host "=== Verificación de Configuración de Podman ===" -ForegroundColor Cyan
Write-Host ""

# Verificar versión de Podman
Write-Host "1. Versión de Podman:" -ForegroundColor Yellow
podman --version
Write-Host ""

# Verificar información de la máquina
Write-Host "2. Información de Podman Machine:" -ForegroundColor Yellow
podman machine inspect 2>&1 | Select-Object -First 20
Write-Host ""

# Verificar uso de recursos
Write-Host "3. Uso de Disco:" -ForegroundColor Yellow
podman system df
Write-Host ""

# Verificar imágenes
Write-Host "4. Imágenes Locales:" -ForegroundColor Yellow
podman images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}" | Select-Object -First 10
Write-Host ""

# Verificar contenedores
Write-Host "5. Contenedores:" -ForegroundColor Yellow
podman ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Size}}"
Write-Host ""

# Recomendaciones
Write-Host "=== Recomendaciones ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para mejorar el rendimiento:" -ForegroundColor Yellow
Write-Host "1. Aumenta CPU/RAM en Podman Desktop: Settings > Resources" -ForegroundColor White
Write-Host "2. Limpia recursos no usados: podman system prune -a" -ForegroundColor White
Write-Host "3. Verifica que .dockerignore esté excluyendo archivos innecesarios" -ForegroundColor White
Write-Host "4. Usa builds incrementales (sin --no-cache a menos que sea necesario)" -ForegroundColor White
Write-Host "5. Excluye directorios de Podman del antivirus" -ForegroundColor White
Write-Host ""

# Verificar .dockerignore
if (Test-Path .dockerignore) {
    Write-Host "✓ .dockerignore existe" -ForegroundColor Green
    $lines = Get-Content .dockerignore | Where-Object { $_ -notmatch '^\s*$' -and $_ -notmatch '^#' }
    Write-Host "  Líneas activas: $($lines.Count)" -ForegroundColor Gray
} else {
    Write-Host "⚠ .dockerignore no existe - se recomienda crearlo" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Para más información, consulta PODMAN_PERFORMANCE.md" -ForegroundColor Cyan

