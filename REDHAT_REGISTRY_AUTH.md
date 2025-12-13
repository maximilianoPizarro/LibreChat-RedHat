# Autenticación en Red Hat Registry

El proyecto ahora usa la imagen oficial de Red Hat (`registry.redhat.io/ubi9/httpd-24:latest`) que requiere autenticación.

## Autenticación Requerida

Para usar `npm start`, primero necesitas autenticarte en Red Hat Registry.

## Autenticarse en Red Hat Registry

### 1. Obtener credenciales

1. Ve a: https://access.redhat.com/RegistryAuthentication
2. Inicia sesión con tu cuenta de Red Hat Customer Portal
3. Copia tu username y password/token

### 2. Autenticarse con Podman

```powershell
# Autenticarse en Red Hat Registry
podman login registry.redhat.io

# Te pedirá:
# Username: tu-usuario-redhat
# Password: tu-password-o-token
```

O usar el script npm:

```powershell
npm run login:redhat
```

### 3. Construir y ejecutar

```bash
npm start
```

Esto construirá y levantará todos los servicios usando la imagen oficial de Red Hat.

## Verificar autenticación

```powershell
# Verificar que estás autenticado
podman login registry.redhat.io --get-login

# Probar descargar una imagen
podman pull registry.redhat.io/ubi9/httpd-24:latest
```

## Nota sobre tokens

Si usas un token en lugar de password:
- Ve a: https://access.redhat.com/terms-based-registry
- Genera un token
- Usa el token como password al hacer login

## Solución rápida (sin autenticación)

Si no tienes credenciales de Red Hat, simplemente usa la versión pública que ya está configurada:

```bash
npm start
```

Esto usará `httpd:2.4-alpine` que es una imagen pública y no requiere autenticación.

