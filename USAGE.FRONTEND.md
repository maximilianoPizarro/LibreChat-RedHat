# Cómo usar el Dockerfile del Frontend

## Dos Versiones Disponibles

### 1. Dockerfile.frontend.simple (Recomendado si ya tienes el build)
Usa este si ya ejecutaste `npm run frontend` o `npm run build:client` localmente.

### 2. Dockerfile.frontend (Build completo en el contenedor)
Usa este si quieres que el contenedor construya todo desde cero.

## Opción 1: Usar build pre-existente (Simple)

### Paso 1: Construir el frontend localmente

```bash
# Desde la raíz del proyecto
npm run frontend

# O solo el cliente
npm run build:client
```

Esto creará `client/dist` con todos los archivos construidos.

### Paso 2: Construir la imagen Docker

```bash
# Con Docker
docker build -f Dockerfile.frontend.simple -t librechat-frontend:latest .

# O con Podman
podman build -f Dockerfile.frontend.simple -t librechat-frontend:latest .
```

### Paso 3: Ejecutar el contenedor

```bash
# Con Docker
docker run -d -p 8080:8080 --name librechat-frontend librechat-frontend:latest

# O con Podman
podman run -d -p 8080:8080 --name librechat-frontend librechat-frontend:latest
```

## Opción 2: Build completo en el contenedor

Si prefieres que el contenedor construya todo:

```bash
# Construir
docker build -f Dockerfile.frontend -t librechat-frontend:latest .

# Ejecutar
docker run -d -p 8080:8080 --name librechat-frontend librechat-frontend:latest
```

## Usar con docker-compose

Actualiza `docker-compose.frontend.yml` para usar la versión simple:

```yaml
frontend:
  build:
    context: .
    dockerfile: Dockerfile.frontend.simple  # Cambiar aquí
```

Luego:

```bash
# Primero construir el frontend localmente
npm run frontend

# Luego construir y ejecutar con docker-compose
docker-compose -f docker-compose.frontend.yml build frontend
docker-compose -f docker-compose.frontend.yml up -d
```

## Acceso

Una vez ejecutado, el frontend estará disponible en:
- **URL**: `http://localhost:8080`

## Comandos Útiles

### Ver logs

```bash
docker logs -f librechat-frontend
# O con Podman
podman logs -f librechat-frontend
```

### Detener

```bash
docker stop librechat-frontend && docker rm librechat-frontend
# O con Podman
podman stop librechat-frontend && podman rm librechat-frontend
```

### Reiniciar

```bash
docker restart librechat-frontend
# O con Podman
podman restart librechat-frontend
```

## Ventajas de cada versión

### Dockerfile.frontend.simple
- ✅ Más rápido (no necesita construir en el contenedor)
- ✅ Imagen más pequeña (solo httpd + archivos)
- ✅ Útil para CI/CD donde ya tienes el build
- ❌ Requiere construir localmente primero

### Dockerfile.frontend
- ✅ Todo en un solo paso
- ✅ No necesitas Node.js localmente
- ✅ Reproducible (mismo entorno de build)
- ❌ Más lento (construye todo en el contenedor)
- ❌ Imagen más grande (incluye Node.js en builder stage)

## Recomendación

**Usa `Dockerfile.frontend.simple`** si:
- Ya tienes el frontend construido
- Quieres builds más rápidos
- Estás en CI/CD con build previo

**Usa `Dockerfile.frontend`** si:
- Quieres todo en un solo comando
- No tienes Node.js localmente
- Quieres máxima reproducibilidad
