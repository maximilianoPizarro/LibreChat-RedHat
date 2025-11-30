# Configuración de Podman en Windows

Esta guía te ayudará a configurar Podman en Windows para ejecutar Red Hat Chat.

## Problema Común

Si ves errores como:
```
'podman-compose' is not recognized as an internal or external command
Cannot connect to Podman. Please verify your connection to the Linux system
```

Significa que Podman no está configurado correctamente en Windows.

## Solución: Instalar Podman Desktop (Recomendado)

### Opción 1: Podman Desktop (Más fácil)

1. **Descargar Podman Desktop:**
   - Visita: https://podman-desktop.io/
   - Descarga el instalador para Windows
   - Ejecuta el instalador y sigue las instrucciones

2. **Iniciar Podman Desktop:**
   - Abre Podman Desktop desde el menú de inicio
   - Espera a que inicialice la máquina virtual (puede tomar unos minutos la primera vez)

3. **Verificar instalación:**
   ```powershell
   podman --version
   podman machine list
   ```

### Opción 2: Podman Machine (Línea de comandos)

Si prefieres usar solo la línea de comandos:

1. **Instalar Podman:**
   ```powershell
   # Usando Chocolatey
   choco install podman
   
   # O descarga desde: https://podman.io/getting-started/installation#windows
   ```

2. **Inicializar y arrancar Podman Machine:**
   ```powershell
   podman machine init
   podman machine start
   ```

3. **Verificar conexión:**
   ```powershell
   podman ps
   ```

## Configurar Variables de Entorno

**IMPORTANTE:** El archivo `.env` se crea **automáticamente** desde `env.example.podman` de varias formas:

### Opción 1: Usar npm (Recomendado)

Simplemente ejecuta:
```powershell
npm run start:podman
```

El script automáticamente:
- ✅ Crea el archivo `.env` desde `env.example.podman` si no existe
- ✅ Te muestra qué variables necesitas configurar
- ✅ Inicia los contenedores con Podman

### Opción 2: Usar Script PowerShell Directo

Si ejecutas `podman compose` directamente, puedes usar el script wrapper:

```powershell
# Ejecutar el script wrapper (configura .env automáticamente)
.\scripts\podman-compose.ps1 -f ./podman-compose.yml up -d

# O ejecutar solo el setup de .env
.\scripts\setup-env.ps1
```

El script `podman-compose.ps1`:
- ✅ Verifica y crea `.env` automáticamente antes de ejecutar podman compose
- ✅ Funciona igual que `podman compose` pero con configuración automática
- ✅ Tiene fallback a `podman-compose` si `podman compose` falla

### Opción 3: Configuración Manual

Si prefieres configurar manualmente antes de ejecutar cualquier comando:

### Configuración Manual (Opcional)

Si prefieres configurar manualmente:

1. **Copiar el archivo de ejemplo:**
   ```powershell
   Copy-Item env.example.podman .env
   ```

2. **Editar el archivo `.env`** y configurar las variables requeridas:
   - `MEILI_MASTER_KEY` - Genera una clave segura (ver abajo)
   - `JWT_SECRET` - Genera una clave segura para producción
   - `JWT_REFRESH_SECRET` - Genera una clave segura para producción
   - `DOMAIN` - Ajusta según tu configuración (por defecto: http://localhost:3080)

3. **Generar claves seguras en PowerShell:**
   ```powershell
   # Para MEILI_MASTER_KEY (mínimo 16 caracteres)
   -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
   
   # Para JWT_SECRET y JWT_REFRESH_SECRET (mínimo 32 caracteres)
   -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})
   ```

### Variables Mínimas Requeridas

Para un inicio rápido, solo necesitas configurar estas variables en `.env`:

```bash
PORT=3080
UID=1000
GID=1000
MEILI_MASTER_KEY=tu_clave_secreta_generada
RAG_PORT=8000
DOMAIN=http://localhost:3080
```

**Nota:** El archivo `env.example.podman` incluye todas las variables organizadas por secciones (Requeridas, Básicas, Seguridad, Opcionales) para facilitar la configuración completa cuando la necesites.

### Scripts de Configuración Disponibles

Hay varios scripts disponibles para configurar el `.env`:

**1. Script npm (Node.js):**
```powershell
npm run setup:env
```

**2. Script PowerShell nativo:**
```powershell
.\scripts\setup-env.ps1
```

**3. Script wrapper completo (configura .env + ejecuta podman compose):**
```powershell
.\scripts\podman-compose.ps1 -f ./podman-compose.yml up -d
```

Todos estos scripts verifican si existe `.env` y lo crean desde `env.example.podman` si no existe.

## Usar podman compose (sin guion)

Los scripts en `package.json` intentan usar `podman compose` (nativo) primero y luego `podman-compose` como fallback.

El comando nativo `podman compose` está disponible desde Podman 4.0+ y es la forma recomendada.

### Verificar versión de Podman:
```powershell
podman --version
```

Si tienes Podman 4.0 o superior, puedes usar directamente:
```powershell
podman compose -f ./podman-compose.yml up -d
```

## Solución de Problemas

### Error: "Cannot connect to Podman socket"

1. **Verificar que Podman Machine está corriendo:**
   ```powershell
   podman machine list
   ```

2. **Si no hay máquinas, inicializar una:**
   ```powershell
   podman machine init
   podman machine start
   ```

3. **Si la máquina existe pero no está corriendo:**
   ```powershell
   podman machine start
   ```

### Error: "podman-compose not found"

Los scripts en `package.json` ya tienen un fallback. Si aún tienes problemas:

1. **Usar podman compose directamente (recomendado):**
   ```powershell
   podman compose -f ./podman-compose.yml up -d
   ```

2. **O instalar podman-compose manualmente:**
   ```powershell
   pip3 install podman-compose
   ```

### Error: "Executing external compose provider docker-compose.exe"

Si ves este mensaje:
```
>>>> Executing external compose provider "C:\\Users\\...\\docker-compose.exe". <<<<
```

Esto significa que Podman está usando Docker Compose en lugar del comando nativo. Esto puede funcionar, pero es mejor usar el comando nativo de Podman.

**Solución 1: Forzar uso del comando nativo (Recomendado)**

1. **Verificar la versión de Podman:**
   ```powershell
   podman --version
   ```

2. **Si tienes Podman 4.0+, el comando nativo debería estar disponible. Para evitar el mensaje:**
   - Asegúrate de que `docker-compose.exe` no esté en tu PATH antes que Podman
   - O usa directamente: `podman compose` (sin el guion) - los scripts ya están configurados así

**Solución 2: Si docker-compose funciona pero quieres silenciar el mensaje**

El mensaje es solo informativo. Si `docker-compose.exe` funciona correctamente, puedes ignorarlo. Sin embargo, es recomendable usar el comando nativo de Podman cuando sea posible.

**Nota:** El error real que estás viendo es por las variables de entorno faltantes, no por el uso de docker-compose. Una vez que crees el archivo `.env` con las variables necesarias, debería funcionar.

### Error: Variables de entorno faltantes

Si ves errores como:
```
The "PORT" variable is not set. Defaulting to a blank string.
The "UID" variable is not set. Defaulting to a blank string.
The "GID" variable is not set. Defaulting to a blank string.
The "MEILI_MASTER_KEY" variable is not set. Defaulting to a blank string.
```

**Solución: Crear archivo `.env`**

1. **Crear un archivo `.env` en la raíz del proyecto** con las siguientes variables mínimas:

```bash
# Puerto del servidor (por defecto 3080)
PORT=3080

# User ID y Group ID para los contenedores (Windows: usar 1000)
UID=1000
GID=1000

# Clave maestra de Meilisearch (genera una clave segura)
MEILI_MASTER_KEY=tu_clave_secreta_aqui_minimo_16_caracteres

# Puerto para RAG API (opcional, por defecto 8000)
RAG_PORT=8000
```

2. **Para Windows, los valores recomendados son:**
   ```bash
   PORT=3080
   UID=1000
   GID=1000
   MEILI_MASTER_KEY=$(openssl rand -hex 16)
   RAG_PORT=8000
   ```

3. **Generar una clave segura para MEILI_MASTER_KEY:**
   ```powershell
   # En PowerShell, puedes generar una clave aleatoria:
   -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
   ```

4. **O usar un generador online** para crear una clave de al menos 16 caracteres.

**Nota:** El archivo `.env` debe estar en la raíz del proyecto (mismo nivel que `podman-compose.yml`).

**Archivo de ejemplo:** Puedes usar `env.example.podman` como base:
```powershell
Copy-Item env.example.podman .env
# Luego edita .env y configura MEILI_MASTER_KEY con una clave segura
```

### Verificar que todo funciona:

```powershell
# Verificar que Podman está funcionando
podman ps

# Verificar que podman compose funciona
podman compose version
```

## Scripts Disponibles

Una vez configurado Podman, puedes usar:

### Scripts npm (Recomendado)

```powershell
# Iniciar servicios (configura .env automáticamente)
npm run start:podman

# Detener servicios
npm run stop:podman

# Construir imagen
npm run build:podman

# Solo configurar .env
npm run setup:env
```

### Scripts PowerShell Directos

```powershell
# Configurar .env manualmente
.\scripts\setup-env.ps1

# Ejecutar podman compose con configuración automática de .env
.\scripts\podman-compose.ps1 -f ./podman-compose.yml up -d
.\scripts\podman-compose.ps1 -f ./podman-compose.yml down
```

### Comandos Podman Directos

Si ya tienes `.env` configurado, puedes usar directamente:

```powershell
# Iniciar servicios
podman compose -f ./podman-compose.yml up -d

# Detener servicios
podman compose -f ./podman-compose.yml down
```

## Notas Adicionales

- Podman Desktop incluye una interfaz gráfica útil para gestionar contenedores
- La primera vez que inicies Podman Machine puede tardar varios minutos
- Asegúrate de tener WSL2 instalado (requerido por Podman en Windows)
- Los scripts ya tienen fallback para `podman-compose` y `podman compose`

## Referencias

- [Podman Desktop](https://podman-desktop.io/)
- [Podman Installation Guide](https://podman.io/getting-started/installation)
- [Podman Compose Documentation](https://github.com/containers/podman-compose)

