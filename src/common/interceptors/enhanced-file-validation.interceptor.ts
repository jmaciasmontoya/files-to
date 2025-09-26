import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

@Injectable()
export class EnhancedFileValidationInterceptor implements NestInterceptor {
  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const file = request.file;

    if (!file) {
      throw new BadRequestException('No se ha proporcionado ningún archivo');
    }

    // Validación básica de tamaño
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new BadRequestException(`El archivo es demasiado grande. Tamaño máximo: ${maxSize / (1024 * 1024)}MB`);
    }

    // Validación básica de MIME type
    const allowedMimeTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp'
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Tipo de archivo no permitido. Tipos permitidos: ${allowedMimeTypes.join(', ')}`
      );
    }

    // 🚨 VALIDACIÓN ROBUSTA DEL CONTENIDO REAL DEL ARCHIVO
    console.log(`🔍 Validando contenido real del archivo: ${file.originalname}`);
    console.log(`📋 MIME type reportado: ${file.mimetype}`);
    
    try {
      // Crear un archivo temporal para validación
      const fs = require('fs');
      const path = require('path');
      const tempDir = './temp-validation';
      
      // Crear directorio temporal si no existe
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      const tempFilePath = path.join(tempDir, `temp-${Date.now()}-${file.originalname}`);
      
      // Escribir el buffer del archivo a un archivo temporal
      fs.writeFileSync(tempFilePath, file.buffer);
      
      console.log(`📁 Archivo temporal creado: ${tempFilePath}`);
      
      // Validar usando el comando 'file'
      const { stdout } = await execAsync(`file -b --mime-type "${tempFilePath}"`);
      const detectedMimeType = stdout.trim();
      
      console.log(`🔍 Tipo detectado por 'file': ${detectedMimeType}`);
      
      // Mapear tipos detectados a tipos esperados
      const typeMapping = {
        'application/pdf': ['application/pdf'],
        'image/jpeg': ['image/jpeg', 'image/jpg'],
        'image/png': ['image/png'],
        'image/gif': ['image/gif'],
        'image/webp': ['image/webp']
      };
      
      let isValid = false;
      let actualType = detectedMimeType;
      
      // Verificar si el tipo detectado coincide con algún tipo permitido
      for (const [allowedType, detectedTypes] of Object.entries(typeMapping)) {
        if (detectedTypes.includes(detectedMimeType)) {
          isValid = true;
          actualType = allowedType;
          break;
        }
      }
      
      // Limpiar archivo temporal
      try {
        fs.unlinkSync(tempFilePath);
      } catch (cleanupError) {
        console.warn('No se pudo limpiar archivo temporal:', cleanupError.message);
      }
      
      if (!isValid) {
        // Log de seguridad
        console.error(`🚨 INTENTO DE SUBIDA MALICIOSA DETECTADO:`);
        console.error(`   - Archivo: ${file.originalname}`);
        console.error(`   - MIME reportado: ${file.mimetype}`);
        console.error(`   - Tipo real detectado: ${detectedMimeType}`);
        
        throw new BadRequestException(
          `Archivo no válido: El archivo parece ser ${detectedMimeType} pero se reportó como ${file.mimetype}. ` +
          `Esto puede indicar un intento de subir un archivo malicioso.`
        );
      }

      console.log(`✅ Archivo validado exitosamente como: ${actualType}`);

    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      console.error(`❌ Error en validación de archivo:`, error);
      throw new BadRequestException(
        `Error validando el archivo: ${error.message}. ` +
        `Por seguridad, el archivo ha sido rechazado.`
      );
    }

    return next.handle();
  }
}
