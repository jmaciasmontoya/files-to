import { Injectable, Logger } from '@nestjs/common';

interface SecurityEvent {
  type: 'malicious_upload' | 'rate_limit_exceeded' | 'invalid_auth' | 'suspicious_activity';
  ip: string;
  userAgent?: string;
  details: any;
  timestamp: Date;
}

interface IPStats {
  ip: string;
  requestCount: number;
  lastRequest: Date;
  maliciousAttempts: number;
  blocked: boolean;
  blockUntil?: Date;
}

@Injectable()
export class SecurityMonitoringService {
  private readonly logger = new Logger(SecurityMonitoringService.name);
  private ipStats = new Map<string, IPStats>();
  private readonly MAX_REQUESTS_PER_MINUTE = 100;
  private readonly MAX_MALICIOUS_ATTEMPTS = 5;
  private readonly BLOCK_DURATION_MINUTES = 30;

  /**
   * Registra un evento de seguridad
   */
  logSecurityEvent(event: SecurityEvent): void {
    this.logger.warn('Security Event Detected', {
      type: event.type,
      ip: event.ip,
      userAgent: event.userAgent,
      details: event.details,
      timestamp: event.timestamp,
    });

    // Actualizar estadísticas de IP
    this.updateIPStats(event.ip, event.type);
  }

  /**
   * Verifica si una IP está bloqueada
   */
  isIPBlocked(ip: string): boolean {
    const stats = this.ipStats.get(ip);
    if (!stats) return false;

    if (stats.blocked && stats.blockUntil) {
      if (new Date() < stats.blockUntil) {
        return true;
      } else {
        // Desbloquear IP
        stats.blocked = false;
        stats.blockUntil = undefined;
        stats.maliciousAttempts = 0;
        this.logger.log(`IP ${ip} unblocked after timeout`);
      }
    }

    return false;
  }

  /**
   * Verifica si una IP excede el rate limit
   */
  checkRateLimit(ip: string): boolean {
    const stats = this.ipStats.get(ip);
    if (!stats) {
      this.ipStats.set(ip, {
        ip,
        requestCount: 1,
        lastRequest: new Date(),
        maliciousAttempts: 0,
        blocked: false,
      });
      return true;
    }

    const now = new Date();
    const timeDiff = now.getTime() - stats.lastRequest.getTime();
    const minutesDiff = timeDiff / (1000 * 60);

    // Resetear contador si han pasado más de 1 minuto
    if (minutesDiff >= 1) {
      stats.requestCount = 1;
      stats.lastRequest = now;
      return true;
    }

    // Verificar límite
    if (stats.requestCount >= this.MAX_REQUESTS_PER_MINUTE) {
      this.logSecurityEvent({
        type: 'rate_limit_exceeded',
        ip,
        details: { requestCount: stats.requestCount, limit: this.MAX_REQUESTS_PER_MINUTE },
        timestamp: now,
      });
      return false;
    }

    stats.requestCount++;
    stats.lastRequest = now;
    return true;
  }

  /**
   * Obtiene estadísticas de una IP
   */
  getIPStats(ip: string): IPStats | undefined {
    return this.ipStats.get(ip);
  }

  /**
   * Obtiene todas las estadísticas
   */
  getAllStats(): IPStats[] {
    return Array.from(this.ipStats.values());
  }

  /**
   * Bloquea una IP manualmente
   */
  blockIP(ip: string, durationMinutes: number = this.BLOCK_DURATION_MINUTES): void {
    const stats = this.ipStats.get(ip);
    if (stats) {
      stats.blocked = true;
      stats.blockUntil = new Date(Date.now() + durationMinutes * 60 * 1000);
      this.logger.warn(`IP ${ip} manually blocked for ${durationMinutes} minutes`);
    }
  }

  /**
   * Desbloquea una IP manualmente
   */
  unblockIP(ip: string): void {
    const stats = this.ipStats.get(ip);
    if (stats) {
      stats.blocked = false;
      stats.blockUntil = undefined;
      this.logger.log(`IP ${ip} manually unblocked`);
    }
  }

  /**
   * Actualiza estadísticas de IP
   */
  private updateIPStats(ip: string, eventType: string): void {
    const stats = this.ipStats.get(ip) || {
      ip,
      requestCount: 0,
      lastRequest: new Date(),
      maliciousAttempts: 0,
      blocked: false,
    };

    if (eventType === 'malicious_upload') {
      stats.maliciousAttempts++;
      
      // Bloquear IP si excede intentos maliciosos
      if (stats.maliciousAttempts >= this.MAX_MALICIOUS_ATTEMPTS) {
        stats.blocked = true;
        stats.blockUntil = new Date(Date.now() + this.BLOCK_DURATION_MINUTES * 60 * 1000);
        this.logger.error(`IP ${ip} blocked due to ${stats.maliciousAttempts} malicious attempts`);
      }
    }

    this.ipStats.set(ip, stats);
  }
}
