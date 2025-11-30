# Script wrapper para podman compose que configura automáticamente .env
# Uso: .\scripts\podman-compose.ps1 -f ./podman-compose.yml up -d
# O: podman-compose.ps1 -f ./podman-compose.yml up -d (si está en PATH)

param(
    [Parameter(ValueFromRemainingArguments=$true)]
    [string[]]$Arguments
)

# Ejecutar script de setup de .env primero
$setupScript = Join-Path $PSScriptRoot "setup-env.ps1"
if (Test-Path $setupScript) {
    & $setupScript
    $setupExitCode = $LASTEXITCODE
    if ($setupExitCode -ne 0 -and $setupExitCode -ne $null) {
        Write-Host "Error al configurar .env. Abortando." -ForegroundColor Red
        exit $setupExitCode
    }
} else {
    Write-Host "⚠️  Advertencia: No se encontró setup-env.ps1" -ForegroundColor Yellow
}

# Construir el comando podman compose con los argumentos
$podmanArgs = @("compose") + $Arguments

# Intentar ejecutar podman compose
Write-Host "Ejecutando: podman $($podmanArgs -join ' ')" -ForegroundColor Cyan
& podman $podmanArgs

# Si falla, intentar con podman-compose como fallback
if ($LASTEXITCODE -ne 0) {
    Write-Host "Intentando con podman-compose como fallback..." -ForegroundColor Yellow
    $composeArgs = $Arguments
    & podman-compose $composeArgs
}

exit $LASTEXITCODE

