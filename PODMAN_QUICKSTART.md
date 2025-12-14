# Guía Rápida: Ejecutar Red Hat Chat con Podman

## ✅ Configuración Completada

El proyecto está configurado y listo para ejecutarse con Podman. Se han configurado las siguientes variables:

- ✅ `ALLOW_REGISTRATION=true` - Registro de usuarios habilitado
- ✅ `ALLOW_EMAIL_LOGIN=true` - Login por email habilitado
- ✅ `MONGO_URI=mongodb://mongodb:27017/LibreChat` - Conexión a MongoDB
- ✅ `MEILI_HOST=http://meilisearch:7700` - Conexión a Meilisearch
- ✅ Variables JWT configuradas
- ✅ Puerto configurado (3080)

## 🚀 Comandos para Ejecutar

### Opción 1: Usar podman compose (Recomendado)

```powershell
# Desde la raíz del proyecto
podman compose -f podman-compose.yml up -d
```

### Opción 2: Usar podman-compose (alternativa)

```powershell
# Si tienes podman-compose instalado
podman-compose -f podman-compose.yml up -d
```

### Opción 3: Usar el script helper

```powershell
# Usa el script que configura automáticamente .env
.\scripts\podman-compose.ps1 -f podman-compose.yml up -d
```

## 📋 Verificar que todo esté corriendo

```powershell
# Ver contenedores activos
podman ps

# Ver logs del backend
podman logs RedHatChat

# Ver logs de MongoDB
podman logs chat-mongodb

# Ver logs de Meilisearch
podman logs chat-meilisearch
```

## 🌐 Acceder a la aplicación

Una vez que los contenedores estén corriendo:

- **Frontend/Backend**: http://localhost:3080
- **API Health**: http://localhost:3080/api/health

## 🛑 Detener los contenedores

```powershell
podman compose -f podman-compose.yml down
```

O si usas podman-compose:

```powershell
podman-compose -f podman-compose.yml down
```

## 🔧 Reconstruir las imágenes

Si necesitas reconstruir las imágenes después de cambios:

```powershell
podman compose -f podman-compose.yml build
podman compose -f podman-compose.yml up -d
```

## 📝 Configuración con Frontend Separado

Si quieres ejecutar frontend y backend por separado:

```powershell
podman compose -f podman-compose.frontend.yml up -d
```

Esto ejecutará:
- Frontend en http://localhost:8080
- Backend en http://localhost:3080

## ⚙️ Variables Importantes en .env

Asegúrate de que estas variables estén configuradas en `.env`:

```env
# Registro (ya configurado)
ALLOW_REGISTRATION=true
ALLOW_EMAIL_LOGIN=true

# Base de datos
MONGO_URI=mongodb://mongodb:27017/LibreChat
MEILI_HOST=http://meilisearch:7700

# Seguridad
JWT_SECRET=tu_secreto_jwt_aqui
JWT_REFRESH_SECRET=tu_refresh_secret_aqui
MEILI_MASTER_KEY=tu_meili_key_aqui

# Puerto
PORT=3080
```

## 🐛 Solución de Problemas

### Error: "Cannot connect to Podman"

1. Asegúrate de que Podman Desktop esté corriendo
2. O inicia Podman Machine:
   ```powershell
   podman machine start
   ```

### Error: "Port already in use"

Cambia el puerto en `.env`:
```env
PORT=3081
```

### Error: "MongoDB connection failed"

Verifica que el contenedor de MongoDB esté corriendo:
```powershell
podman ps | Select-String mongodb
```

### Ver logs de errores

```powershell
# Logs del backend
podman logs RedHatChat --tail 100

# Logs de todos los servicios
podman compose -f podman-compose.yml logs
```

## 📚 Más Información

- [PODMAN_WINDOWS_SETUP.md](./PODMAN_WINDOWS_SETUP.md) - Configuración detallada de Podman en Windows
- [PODMAN_PERFORMANCE.md](./PODMAN_PERFORMANCE.md) - Optimización de rendimiento
- [env.example.podman](./env.example.podman) - Ejemplo completo de variables de entorno

## ✨ Características Habilitadas

- ✅ Registro de usuarios (`ALLOW_REGISTRATION=true`)
- ✅ Login por email (`ALLOW_EMAIL_LOGIN=true`)
- ✅ Base de datos MongoDB
- ✅ Búsqueda con Meilisearch
- ✅ Vector DB (pgvector) para RAG (opcional)

¡Listo para usar! 🎉

