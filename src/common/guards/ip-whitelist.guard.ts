import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { FileConfig } from '../../config/file.config';

@Injectable()
export class IPWhitelistGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const clientIP = this.getClientIP(request);
    const allowedIPs = FileConfig.getAllowedIPs();

    // Si no hay IPs configuradas, permitir acceso
    if (allowedIPs.length === 0) {
      return true;
    }

    const isAllowed = allowedIPs.includes(clientIP) || 
                      allowedIPs.includes('0.0.0.0'); // Permitir todas las IPs

    if (!isAllowed) {
      throw new ForbiddenException(`IP ${clientIP} no está autorizada`);
    }

    return true;
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
