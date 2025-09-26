# Comandos de Instalación y Configuración

## 1. Instalar dependencias
```bash
npm install
```

## 2. Configurar base de datos PostgreSQL
```sql
-- Conectar a PostgreSQL como superusuario
sudo -u postgres psql

-- Crear base de datos
CREATE DATABASE filemanager;

-- Crear usuario (opcional)
CREATE USER filemanager_user WITH PASSWORD 'tu_password';
GRANT ALL PRIVILEGES ON DATABASE filemanager TO filemanager_user;
```

## 3. Configurar variables de entorno
```bash
# Copiar archivo de ejemplo
cp env.example .env

# Editar variables según tu configuración
nano .env
```

## 4. Ejecutar la aplicación
```bash
# Desarrollo (con hot reload)
npm run start:dev

# Producción
npm run build
npm run start:prod
```

## 5. Verificar que funciona
```bash
# El servidor debería estar corriendo en http://localhost:3000
curl http://localhost:3000/files/test
```

## Comandos útiles

### Desarrollo
```bash
# Ejecutar en modo debug
npm run start:debug

# Ejecutar tests
npm run test

# Ejecutar tests en modo watch
npm run test:watch

# Ejecutar tests con coverage
npm run test:cov
```

### Linting y formateo
```bash
# Ejecutar linter
npm run lint

# Formatear código
npm run format
```

### Build
```bash
# Compilar TypeScript
npm run build

# Verificar build
ls -la dist/
```

## Estructura de directorios creada
```
backend-nestjs/
├── src/
│   ├── app.module.ts
│   ├── main.ts
│   ├── config/
│   │   ├── database.config.ts
│   │   ├── file.config.ts
│   │   └── auth.config.ts
│   ├── common/
│   │   ├── guards/
│   │   │   ├── ip-whitelist.guard.ts
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── api-key.guard.ts
│   │   ├── decorators/
│   │   │   └── auth.decorator.ts
│   │   └── interceptors/
│   │       └── file-validation.interceptor.ts
│   ├── modules/
│   │   ├── files/
│   │   │   ├── files.module.ts
│   │   │   ├── files.controller.ts
│   │   │   ├── files.service.ts
│   │   │   ├── entities/
│   │   │   │   └── file.entity.ts
│   │   │   └── dto/
│   │   │       └── upload-response.dto.ts
│   │   └── auth/
│   │       ├── auth.module.ts
│   │       ├── auth.service.ts
│   │       ├── strategies/
│   │       │   └── jwt.strategy.ts
│   │       └── dto/
│   │           └── login.dto.ts
│   └── uploads/ (se crea automáticamente)
├── config/
│   ├── app.config.json
│   └── allowed-ips.txt
├── package.json
├── tsconfig.json
├── nest-cli.json
├── .gitignore
├── README.md
└── env.example
```

## Próximos pasos

1. **Configurar base de datos**: Asegúrate de que PostgreSQL esté ejecutándose
2. **Configurar variables de entorno**: Edita el archivo `.env` con tus credenciales
3. **Instalar dependencias**: Ejecuta `npm install`
4. **Ejecutar la aplicación**: Usa `npm run start:dev`
5. **Probar endpoints**: Usa los ejemplos del README.md

## Notas importantes

- Los archivos se organizan automáticamente por año/mes en la carpeta `uploads/`
- La configuración se carga desde `config/app.config.json`
- Las IPs permitidas se configuran en `config/allowed-ips.txt`
- El proyecto está listo para producción con las configuraciones adecuadas
