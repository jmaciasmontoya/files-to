# 🧪 Batería de Pruebas - Sistema de Gestión de Archivos

## Descripción
Esta batería de pruebas evalúa completamente el sistema de gestión de archivos del backend NestJS, incluyendo subida, descarga, eliminación y validaciones de seguridad.

## Archivos de Prueba Creados

### Archivos Válidos (deberían pasar)
- **small.pdf** (1KB) - PDF pequeño
- **medium.pdf** (5MB) - PDF mediano  
- **large.pdf** (15MB) - PDF grande (dentro del límite)
- **small.jpg** (1KB) - Imagen pequeña
- **medium.jpg** (3MB) - Imagen mediana
- **large.jpg** (8MB) - Imagen grande

### Archivos Inválidos (deberían fallar)
- **oversized.pdf** (20MB) - Excede límite de 10MB
- **test.txt** (21 bytes) - Tipo de archivo no permitido

## Scripts de Prueba

### 1. `test-upload.sh` - Pruebas de Subida
**Funcionalidades probadas:**
- ✅ Subida de archivos PDF válidos (diferentes tamaños)
- ✅ Subida de archivos de imagen válidos (diferentes tamaños)
- ❌ Rechazo de archivos que exceden el límite de tamaño (10MB)
- ❌ Rechazo de tipos de archivo no permitidos (.txt)
- ❌ Rechazo de peticiones sin archivo
- 🔐 Validación de autenticación

**Casos de prueba:**
1. PDF pequeño (1KB) - Esperado: HTTP 200
2. PDF mediano (5MB) - Esperado: HTTP 200
3. PDF grande (15MB) - Esperado: HTTP 200
4. PDF muy grande (20MB) - Esperado: HTTP 400
5. Imagen pequeña (1KB) - Esperado: HTTP 200
6. Imagen mediana (3MB) - Esperado: HTTP 200
7. Imagen grande (8MB) - Esperado: HTTP 200
8. Archivo .txt - Esperado: HTTP 400
9. Sin archivo - Esperado: HTTP 400

### 2. `test-download.sh` - Pruebas de Descarga
**Funcionalidades probadas:**
- ✅ Descarga de archivos subidos exitosamente
- ✅ Obtención de información de archivos
- ❌ Manejo de UUIDs inexistentes
- 🔐 Validación de autenticación

**Casos de prueba:**
1. Descarga de cada archivo subido - Esperado: HTTP 200
2. Información de cada archivo - Esperado: HTTP 200
3. UUID inexistente - Esperado: HTTP 404
4. Sin autenticación - Esperado: HTTP 401

### 3. `test-delete.sh` - Pruebas de Eliminación
**Funcionalidades probadas:**
- ✅ Eliminación de archivos existentes
- ✅ Verificación de eliminación exitosa
- ❌ Manejo de UUIDs inexistentes
- 🔐 Validación de autenticación

**Casos de prueba:**
1. Eliminación de archivos - Esperado: HTTP 200
2. Verificación de eliminación - Esperado: HTTP 404
3. UUID inexistente - Esperado: HTTP 404
4. Sin autenticación - Esperado: HTTP 401

### 4. `run-all-tests.sh` - Script Maestro
**Funcionalidades:**
- 🔍 Verificación del servidor
- 📤 Ejecución de pruebas de subida
- 📥 Ejecución de pruebas de descarga
- 🗑️ Ejecución de pruebas de eliminación
- 📊 Resumen final con estadísticas

## Configuración del Sistema

### Límites Configurados
- **Tamaño máximo:** 10MB (configurado en `config/app.config.json`)
- **Tipos permitidos:** PDF, JPEG, PNG, JPG
- **Autenticación:** JWT Bearer Token

### Endpoints Probados
- `POST /files/upload` - Subir archivo
- `GET /files/:uuid` - Descargar archivo
- `GET /files/:uuid/info` - Información del archivo
- `DELETE /files/:uuid` - Eliminar archivo

## Cómo Ejecutar las Pruebas

### Opción 1: Ejecutar todas las pruebas
```bash
./run-all-tests.sh
```

### Opción 2: Ejecutar pruebas individuales
```bash
# Solo pruebas de subida
./test-upload.sh

# Solo pruebas de descarga (requiere archivos subidos)
./test-download.sh

# Solo pruebas de eliminación (requiere archivos subidos)
./test-delete.sh
```

## Archivos de Resultados

Después de ejecutar las pruebas, se generan los siguientes archivos:

- **`FINAL_TEST_RESULTS.txt`** - Resumen completo de todas las pruebas
- **`test-results.txt`** - Resultados detallados de pruebas de subida
- **`test-results-download.txt`** - Resultados detallados de pruebas de descarga
- **`test-results-delete.txt`** - Resultados detallados de pruebas de eliminación
- **`uploaded_files.txt`** - Lista de UUIDs de archivos subidos exitosamente

## Interpretación de Resultados

### Códigos de Estado HTTP Esperados
- **200** - Operación exitosa
- **400** - Error de validación (archivo inválido, muy grande, etc.)
- **401** - No autorizado (falta autenticación)
- **404** - Archivo no encontrado

### Indicadores de Éxito
- ✅ **PASS** - Prueba exitosa
- ❌ **FAIL** - Prueba fallida
- ⚠️ **INFO** - Información adicional

## Requisitos Previos

1. **Servidor funcionando:** El backend debe estar ejecutándose en `http://localhost:3000`
2. **Base de datos:** PostgreSQL debe estar configurado y funcionando
3. **Permisos:** Los scripts deben tener permisos de ejecución

## Notas Importantes

- Las pruebas usan un token JWT de prueba (`test-token`)
- Los archivos de prueba se crean automáticamente en el directorio `test-files/`
- Los archivos subidos se almacenan en `uploads/YYYY/MM/`
- Las pruebas de descarga y eliminación requieren que se ejecuten primero las pruebas de subida

## Solución de Problemas

### Error: "Servidor no responde"
- Verificar que el servidor esté ejecutándose: `npm run start:dev`
- Verificar que esté escuchando en el puerto 3000

### Error: "No se encontraron archivos subidos"
- Ejecutar primero `./test-upload.sh`
- Verificar que `uploaded_files.txt` contenga UUIDs

### Error: "Código HTTP inesperado"
- Verificar la configuración de autenticación
- Revisar los logs del servidor para errores específicos
