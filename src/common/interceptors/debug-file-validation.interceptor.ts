import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class DebugFileValidationInterceptor implements NestInterceptor {
  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const file = request.file;

    console.log('🔍 DEBUG - Archivo recibido:', {
      originalname: file?.originalname,
      mimetype: file?.mimetype,
      size: file?.size,
      path: file?.path,
      fieldname: file?.fieldname,
      encoding: file?.encoding,
      destination: file?.destination,
      filename: file?.filename
    });

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

    // Verificar que tenemos la ruta del archivo
    if (!file.path) {
      console.error('❌ ERROR: No se pudo determinar la ruta del archivo');
      throw new BadRequestException(
        'No se pudo determinar la ruta del archivo para validación. ' +
        'Por seguridad, el archivo ha sido rechazado.'
      );
    }

    console.log('✅ Archivo pasa validaciones básicas, continuando...');

    return next.handle();
  }
}
