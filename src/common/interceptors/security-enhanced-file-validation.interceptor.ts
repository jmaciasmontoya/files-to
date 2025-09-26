import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { FileConfig } from '../../config/file.config';
import { SecurityMonitoringService } from '../services/security-monitoring.service';
import { SanitizationService } from '../services/sanitization.service';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

@Injectable()
export class SecurityEnhancedFileValidationInterceptor implements NestInterceptor {
  private readonly logger = new Logger(SecurityEnhancedFileValidationInterceptor.name);

  constructor(
    private readonly securityMonitoring: SecurityMonitoringService,
    private readonly sanitization: SanitizationService,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const file = request.file;
    const clientIP = this.getClientIP(request);
    const userAgent = request.headers['user-agent'];

    // Verificar si la IP está bloqueada
    if (this.securityMonitoring.isIPBlocked(clientIP)) {
      this.logger.warn(`Blocked IP attempted access: ${clientIP}`);
      throw new BadRequestException('Acceso denegado. IP bloqueada temporalmente.');
    }

    // Verificar rate limiting
    if (!this.securityMonitoring.checkRateLimit(clientIP)) {
      this.logger.warn(`Rate limit exceeded for IP: ${clientIP}`);
      throw new BadRequestException('Demasiadas solicitudes. Intenta de nuevo más tarde.');
    }

    if (!file) {
      throw new BadRequestException('No se ha proporcionado ningún archivo');
    }

    // Sanitizar nombre de archivo
    const originalName = file.originalname;
    const sanitizedName = this.sanitization.sanitizeFilename(originalName);
    
    if (!this.sanitization.isSafeFilename(sanitizedName)) {
      this.logger.warn(`Unsafe filename detected: ${originalName} from IP: ${clientIP}`);
      this.securityMonitoring.logSecurityEvent({
        type: 'suspicious_activity',
        ip: clientIP,
        userAgent,
        details: { filename: originalName, reason: 'unsafe_filename' },
        timestamp: new Date(),
      });
      throw new BadRequestException('Nombre de archivo no válido o inseguro');
    }

    // Actualizar nombre sanitizado
    file.originalname = sanitizedName;

    const { maxFileSize, allowedMimeTypes } = FileConfig.getConfig();

    // 1. Validación de tamaño
    if (file.size > maxFileSize) {
      this.logger.warn(`Oversized file attempt: ${file.size} bytes from IP: ${clientIP}`);
      throw new BadRequestException(
        `El archivo es demasiado grande. Tamaño máximo: ${maxFileSize / (1024 * 1024)}MB`,
      );
    }

    // 2. Validación de MIME type reportado por el cliente
    if (!allowedMimeTypes.includes(file.mimetype)) {
      this.logger.warn(`Invalid MIME type: ${file.mimetype} from IP: ${clientIP}`);
      throw new BadRequestException(
        `Tipo de archivo no permitido. Tipos permitidos: ${allowedMimeTypes.join(', ')}`,
      );
    }

    // 3. Validación robusta del contenido real del archivo
    this.logger.debug(`Validating file: ${file.originalname} from IP: ${clientIP}`);
    
    if (!file.path || !require('fs').existsSync(file.path)) {
      this.logger.error(`File path not accessible: ${file.path}`);
      throw new BadRequestException(
        'No se pudo acceder al archivo temporal para validación. ' +
        'Por seguridad, el archivo ha sido rechazado.',
      );
    }

    let detectedMimeType: string;
    let isValid = false;

    try {
      // Usar 'file' para detectar el tipo real del archivo
      const { stdout } = await execAsync(`file --mime-type -b "${file.path}"`);
      detectedMimeType = stdout.trim();
      
      this.logger.debug(`File type detected: ${detectedMimeType} for ${file.originalname}`);

      // Comparar el MIME type detectado con el esperado
      if (detectedMimeType === file.mimetype) {
        isValid = true;
      } else {
        // Log de seguridad para intento malicioso
        this.logger.warn(`Malicious file upload attempt detected`, {
          ip: clientIP,
          filename: file.originalname,
          reportedMime: file.mimetype,
          actualMime: detectedMimeType,
          userAgent,
        });

        this.securityMonitoring.logSecurityEvent({
          type: 'malicious_upload',
          ip: clientIP,
          userAgent,
          details: {
            filename: file.originalname,
            reportedMime: file.mimetype,
            actualMime: detectedMimeType,
            size: file.size,
          },
          timestamp: new Date(),
        });
      }

      // Limpiar archivo temporal
      try {
        require('fs').unlinkSync(file.path);
        this.logger.debug(`Temporary file cleaned: ${file.path}`);
      } catch (cleanupError) {
        this.logger.error('Failed to clean temporary file:', cleanupError.message);
      }

      if (!isValid) {
        throw new BadRequestException(
          `Archivo no válido: El archivo parece ser ${detectedMimeType} pero se reportó como ${file.mimetype}. ` +
          `Esto puede indicar un intento de subir un archivo malicioso.`
        );
      }

      this.logger.log(`File validation successful: ${file.originalname} (${detectedMimeType})`);

    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      this.logger.error(`File validation error:`, error);
      throw new BadRequestException(
        `Error validando el archivo: ${error.message}. ` +
        `Por seguridad, el archivo ha sido rechazado.`
      );
    }

    return next.handle();
  }

  private getClientIP(request: any): string {
    return (
      request.headers['x-forwarded-for']?.split(',')[0] ||
      request.headers['x-real-ip'] ||
      request.connection?.remoteAddress ||
      request.socket?.remoteAddress ||
      request.ip ||
      '0.0.0.0'
    );
  }
}
