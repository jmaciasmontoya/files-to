import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { FileValidationService } from '../services/file-validation.service';

@Injectable()
export class RobustFileValidationInterceptor implements NestInterceptor {
  constructor(private readonly fileValidationService: FileValidationService) {}

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
    console.log(`📁 Ruta del archivo: ${file.path}`);
    
    // Verificar que tenemos la ruta del archivo
    if (!file.path) {
      throw new BadRequestException(
        'No se pudo determinar la ruta del archivo para validación. ' +
        'Por seguridad, el archivo ha sido rechazado.'
      );
    }
    
    try {
      const validationResult = await this.fileValidationService.validateFileContent(
        file.path,
        file.mimetype
      );

      console.log(`🔍 Resultado de validación:`, validationResult);

      if (!validationResult.isValid) {
        // Log de seguridad
        console.error(`🚨 INTENTO DE SUBIDA MALICIOSA DETECTADO:`);
        console.error(`   - Archivo: ${file.originalname}`);
        console.error(`   - MIME reportado: ${file.mimetype}`);
        console.error(`   - Tipo real detectado: ${validationResult.actualType}`);
        console.error(`   - Error: ${validationResult.error}`);
        
        throw new BadRequestException(
          `Archivo no válido: ${validationResult.error}. ` +
          `El archivo parece ser ${validationResult.actualType} pero se reportó como ${file.mimetype}. ` +
          `Esto puede indicar un intento de subir un archivo malicioso.`
        );
      }

      console.log(`✅ Archivo validado exitosamente como: ${validationResult.actualType}`);

      // Agregar información de validación al objeto file
      file.validationResult = validationResult;
      file.actualMimeType = validationResult.actualType;

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
