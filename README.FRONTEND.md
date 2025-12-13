# Frontend Container Setup

Este documento explica cómo usar el contenedor de frontend separado del backend.

## Arquitectura

- **Frontend**: Contenedor httpd (Apache) que sirve los archivos estáticos del frontend en el puerto 8080
- **Backend**: Contenedor Node.js que sirve la API en el puerto 3080

## Construcción

### Construir solo el frontend:

```bash
docker build -f Dockerfile.frontend -t librechat-frontend:latest .
```

### Construir solo el backend:

```bash
docker build -f Dockerfile -t librechat-backend:latest .
```

### Construir ambos con docker-compose:

```bash
docker-compose -f docker-compose.frontend.yml build
```

## Ejecución

### Con docker-compose (recomendado):

```bash
docker-compose -f docker-compose.frontend.yml up -d
```

Esto iniciará:
- Frontend en `http://localhost:8080`
- Backend en `http://localhost:3080`

### Manualmente:

```bash
# Frontend
docker run -d -p 8080:8080 --name librechat-frontend librechat-frontend:latest

# Backend
docker run -d -p 3080:3080 --name librechat-backend \
  -e MONGODB_URI=mongodb://mongo:27017/librechat \
  librechat-backend:latest
```

## Configuración del Frontend

El frontend necesita conocer la URL del backend. Esto se puede configurar de varias maneras:

### 1. Variable de entorno (recomendado):

En `docker-compose.frontend.yml`, configura `BACKEND_URL`:

```yaml
frontend:
  environment:
    - BACKEND_URL=http://backend:3080
```

### 2. Configuración en runtime:

El frontend puede leer la configuración desde un archivo `config.js` que se genera en runtime.

## Proxy Reverso (Opcional)

Si quieres servir ambos desde el mismo dominio, puedes usar un proxy reverso como nginx:

```nginx
server {
    listen 80;
    server_name librechat.example.com;

    # Frontend
    location / {
        proxy_pass http://frontend:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Backend API
    location /api {
        proxy_pass http://backend:3080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Ventajas de la Separación

1. **Escalabilidad**: Puedes escalar el frontend y backend independientemente
2. **Despliegue**: Puedes actualizar el frontend sin afectar el backend
3. **CDN**: Puedes servir el frontend desde un CDN
4. **Caché**: Mejor control de caché para archivos estáticos
5. **Seguridad**: Separación de responsabilidades

## Troubleshooting

### El frontend no puede conectarse al backend

- Verifica que `BACKEND_URL` esté configurado correctamente
- Verifica que ambos contenedores estén en la misma red Docker
- Verifica que el backend esté escuchando en `0.0.0.0` (no `localhost`)

### Error de CORS

- Asegúrate de que el backend tenga configurado CORS correctamente
- Verifica que `BACKEND_URL` apunte al backend correcto

### React no se carga correctamente

- Limpia la caché del navegador
- Verifica que el import map esté correcto en `index.html`
- Verifica que los módulos de React se estén cargando desde el CDN

