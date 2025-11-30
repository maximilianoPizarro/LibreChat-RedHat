# Optimización de Rendimiento de Podman en Windows

## Configuración de Podman Machine

### 1. Aumentar Recursos de la Máquina Virtual

Por defecto, Podman Machine en Windows usa recursos limitados. Puedes aumentar CPU, RAM y disco:

```powershell
# Ver configuración actual
podman machine inspect

# Editar la máquina (requiere reiniciar)
# Abre Podman Desktop > Settings > Resources
# O edita manualmente el archivo de configuración de la VM
```

**Recomendaciones:**
- **CPU**: Mínimo 4 cores (mejor 6-8 si tienes disponibles)
- **RAM**: Mínimo 4GB, recomendado 8GB o más
- **Disco**: Mínimo 60GB, recomendado 100GB+ para builds grandes

### 2. Configurar BuildKit (si está disponible)

BuildKit puede acelerar significativamente los builds:

```powershell
# Verificar si BuildKit está disponible
podman build --help | Select-String -Pattern "buildkit"

# Usar BuildKit si está disponible
$env:DOCKER_BUILDKIT=1
$env:COMPOSE_DOCKER_CLI_BUILD=1
```

### 3. Optimizar el Sistema de Archivos

En Windows, el acceso a archivos a través de WSL2/Podman puede ser lento. Considera:

- **Usar volúmenes nombrados** en lugar de bind mounts cuando sea posible
- **Evitar sincronización de archivos grandes** durante el build
- **Usar `.dockerignore`** para excluir archivos innecesarios

### 4. Configuración de Red

```powershell
# Verificar configuración de red
podman network ls

# Usar red bridge en lugar de slirp4netns si es posible
# (mejor rendimiento de red)
```

## Optimizaciones del Dockerfile

### Cache de Capas

El Dockerfile actual está optimizado para usar cache de capas:
1. Instala dependencias del sistema primero (cambian raramente)
2. Copia solo `package.json` antes de `npm install` (caché de dependencias)
3. Copia el código fuente al final (cambia frecuentemente)

### Mejoras Adicionales

1. **Usar BuildKit cache mounts** (si está disponible):
   ```dockerfile
   RUN --mount=type=cache,target=/root/.npm \
       npm install --no-audit
   ```

2. **Paralelizar instalaciones** cuando sea posible

3. **Usar multi-stage builds** para reducir tamaño final

## Comandos Útiles

### Limpiar Cache y Recursos No Usados

```powershell
# Limpiar imágenes no usadas
podman image prune -a

# Limpiar volúmenes no usados
podman volume prune

# Limpiar todo (cuidado: elimina todo lo no usado)
podman system prune -a --volumes

# Ver uso de disco
podman system df
```

### Builds Incrementales

```powershell
# Build sin cache (solo si necesitas rebuild completo)
podman build --no-cache -t redhat-chat:latest .

# Build con cache (por defecto, más rápido)
podman build -t redhat-chat:latest .

# Ver progreso detallado
podman build --progress=plain -t redhat-chat:latest .
```

### Monitorear Recursos

```powershell
# Ver uso de recursos de contenedores
podman stats

# Ver información de la máquina
podman machine inspect
```

## Optimizaciones Específicas para Windows

### 1. Usar WSL2 Backend (si está disponible)

Podman Desktop puede usar WSL2 como backend, que es más rápido:

1. Abre Podman Desktop
2. Settings > Resources > WSL Integration
3. Habilita integración con WSL2

### 2. Configurar Antivirus

Excluye los directorios de Podman del escaneo del antivirus:
- `%USERPROFILE%\.local\share\containers`
- `%USERPROFILE%\.wsl2` (si usas WSL2)

### 3. Deshabilitar Indexación de Windows

Deshabilita la indexación de Windows para:
- Directorio del proyecto
- Directorio de Podman

## Troubleshooting

### Builds Muy Lentos

1. **Verificar recursos de la VM:**
   ```powershell
   podman machine inspect
   ```

2. **Aumentar recursos si es necesario**

3. **Verificar que `.dockerignore` esté funcionando:**
   ```powershell
   # Ver qué archivos se están copiando
   podman build --progress=plain . 2>&1 | Select-String -Pattern "COPY"
   ```

### Problemas de Memoria

Si el build falla por falta de memoria:

```powershell
# Aumentar memoria de la VM
# En Podman Desktop: Settings > Resources > Memory
# O edita la configuración de la VM manualmente
```

### Problemas de Disco

Si se queda sin espacio:

```powershell
# Limpiar todo lo no usado
podman system prune -a --volumes

# Ver uso de disco
podman system df
```

## Referencias

- [Podman Performance Tuning](https://docs.podman.io/en/latest/markdown/podman-system.1.html)
- [Docker Build Performance](https://docs.docker.com/build/guide/optimizing-builds/)
- [Podman Desktop Settings](https://podman-desktop.io/docs/configuration)

