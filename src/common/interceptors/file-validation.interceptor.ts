import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { FileConfig } from '../../config/file.config';

@Injectable()
export class FileValidationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const file = request.file;
    
    if (!file) {
      throw new BadRequestException('No se ha proporcionado ningún archivo');
    }

    const config = FileConfig.getConfig();

    // Validar tamaño
    if (file.size > config.maxFileSize) {
      throw new BadRequestException(
        `El archivo es demasiado grande. Tamaño máximo: ${config.maxFileSize / (1024 * 1024)}MB`
      );
    }

    // Validar tipo MIME
    if (!config.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Tipo de archivo no permitido. Tipos permitidos: ${config.allowedMimeTypes.join(', ')}`
      );
    }

    return next.handle();
  }
}
