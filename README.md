# Backend NestJS - Gestión de Archivos

## Descripción
Backend desarrollado con NestJS para la gestión segura de archivos con autenticación JWT, incluyendo validación robusta de tipos de archivo, organización por carpetas y control de acceso por IP.

## Características
- ✅ Autenticación JWT
- ✅ Validación robusta de tipos de archivo y tamaño
- ✅ Validación de contenido real (detección de archivos maliciosos)
- ✅ Organización automática por año/mes
- ✅ Control de acceso por IP
- ✅ Base de datos PostgreSQL
- ✅ Interceptors de validación avanzada
- ✅ Guards de seguridad
- ✅ Configuración flexible
- ✅ Endpoints de prueba sin autenticación
- ✅ **Rate Limiting** multi-nivel
- ✅ **Logging estructurado** con Winston
- ✅ **Headers de seguridad** con Helmet
- ✅ **Sanitización** de nombres de archivo
- ✅ **Monitoreo de seguridad** en tiempo real
- ✅ **Validación de DTOs** con class-validator

## Instalación

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
Copia el archivo `env.example` a `.env` y configura las variables:
```bash
cp env.example .env
```

### 3. Configurar base de datos
Asegúrate de tener PostgreSQL ejecutándose y crear la base de datos:
```sql
CREATE DATABASE filemanager;
```

### 4. Ejecutar la aplicación
```bash
# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod
```

## Estructura del Proyecto

```
src/
├── app.module.ts
├── main.ts
├── config/
│   ├── database.config.ts
│   ├── file.config.ts
│   └── auth.config.ts
├── common/
│   ├── guards/
│   │   ├── ip-whitelist.guard.ts
│   │   └── jwt-auth.guard.ts
│   ├── decorators/
│   │   └── auth.decorator.ts
│   ├── interceptors/
│   │   ├── file-validation.interceptor.ts
│   │   ├── enhanced-file-validation.interceptor.ts
│   │   └── security-enhanced-file-validation.interceptor.ts
│   └── services/
│       ├── file-validation.service.ts
│       ├── security-monitoring.service.ts
│       └── sanitization.service.ts
├── modules/
│   ├── files/
│   │   ├── files.module.ts
│   │   ├── files.controller.ts
│   │   ├── files-test.controller.ts
│   │   ├── files-test-secure.controller.ts
│   │   ├── files.service.ts
│   │   ├── entities/
│   │   │   └── file.entity.ts
│   │   └── dto/
│   │       ├── upload-response.dto.ts
│   │       └── upload-file.dto.ts
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.service.ts
│   │   ├── auth.controller.ts
│   │   ├── strategies/
│   │   │   └── jwt.strategy.ts
│   │   └── dto/
│   │       └── login.dto.ts
│   └── security/
│       ├── security.module.ts
│       └── security.controller.ts
├── uploads/ (creado automáticamente)
└── config/ (archivos de configuración)
    ├── app.config.json
    └── allowed-ips.txt
```

## API Endpoints

### Archivos (Con Autenticación JWT)
- `POST /files/upload` - Subir archivo
- `GET /files/:uuid` - Descargar archivo
- `GET /files/:uuid/info` - Obtener información del archivo
- `DELETE /files/:uuid` - Eliminar archivo

### Archivos de Prueba (Sin Autenticación)
- `POST /files-test/upload` - Subir archivo para pruebas
- `GET /files-test/:uuid` - Descargar archivo
- `GET /files-test/:uuid/info` - Obtener información del archivo
- `DELETE /files-test/:uuid` - Eliminar archivo

### Archivos de Prueba Seguros (Con Rate Limiting)
- `POST /files-test-secure/upload` - Subir archivo con rate limiting
- `GET /files-test-secure/:uuid` - Descargar archivo
- `GET /files-test-secure/:uuid/info` - Obtener información del archivo
- `DELETE /files-test-secure/:uuid` - Eliminar archivo

### Autenticación
- `POST /auth/test-token` - Generar token de prueba (solo desarrollo)
- `POST /auth/login` - Iniciar sesión (implementar según necesidades)

### Monitoreo de Seguridad (Requiere JWT)
- `GET /security/stats` - Obtener estadísticas de seguridad
- `GET /security/stats/:ip` - Obtener estadísticas de IP específica
- `POST /security/block/:ip` - Bloquear IP manualmente
- `POST /security/unblock/:ip` - Desbloquear IP

## Configuración

### Archivos de configuración
- `config/app.config.json` - Configuración de archivos (tamaño máximo, tipos permitidos)
- `config/allowed-ips.txt` - Lista de IPs permitidas
- `config/throttle.config.ts` - Configuración de rate limiting
- `config/logger.config.ts` - Configuración de logging estructurado
- `.env` - Variables de entorno

### Tipos de archivo permitidos por defecto
- PDF (`application/pdf`)
- JPEG (`image/jpeg`)
- PNG (`image/png`)
- JPG (`image/jpg`)

## Ejemplos de uso

### Subir archivo con JWT
```bash
curl -X POST http://localhost:3000/files/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/your/file.pdf"
```

### Subir archivo de prueba (sin autenticación)
```bash
curl -X POST http://localhost:3000/files-test/upload \
  -F "file=@/path/to/your/file.pdf"
```

### Descargar archivo
```bash
curl -X GET http://localhost:3000/files/UUID_DEL_ARCHIVO \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -o downloaded_file.pdf
```

## Seguridad
- **Validación robusta** de tipos MIME (detección de contenido real)
- **Control de tamaño** de archivos
- **Whitelist de IPs** con bloqueo automático
- **Autenticación JWT** con tokens seguros
- **Sanitización** de nombres de archivo
- **Protección contra archivos maliciosos** con validación de contenido
- **Validación con herramientas del sistema** (file, pdfinfo, identify)
- **Rate Limiting** multi-nivel para prevenir ataques DDoS
- **Headers de seguridad** con Helmet (XSS, CSRF, etc.)
- **Logging estructurado** para monitoreo de seguridad
- **Monitoreo en tiempo real** de IPs y amenazas
- **Validación de DTOs** con class-validator
- **Compresión** y optimización de respuestas

## Desarrollo
```bash
# Ejecutar en modo desarrollo
npm run start:dev

# Ejecutar tests
npm run test

# Linting
npm run lint

# Formatear código
npm run format
```
