import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { SecurityMonitoringService } from '../../common/services/security-monitoring.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('security')
@UseGuards(JwtAuthGuard) // Solo administradores pueden acceder
export class SecurityController {
  constructor(private readonly securityMonitoring: SecurityMonitoringService) {}

  @Get('stats')
  getSecurityStats() {
    const stats = this.securityMonitoring.getAllStats();
    return {
      success: true,
      data: {
        totalIPs: stats.length,
        blockedIPs: stats.filter(ip => ip.blocked).length,
        suspiciousIPs: stats.filter(ip => ip.maliciousAttempts > 0).length,
        stats: stats.map(ip => ({
          ip: ip.ip,
          requestCount: ip.requestCount,
          maliciousAttempts: ip.maliciousAttempts,
          blocked: ip.blocked,
          lastRequest: ip.lastRequest,
        })),
      },
    };
  }

  @Get('stats/:ip')
  getIPStats(@Param('ip') ip: string): any {
    const stats = this.securityMonitoring.getIPStats(ip);
    if (!stats) {
      return {
        success: false,
        error: 'IP no encontrada en las estadísticas',
      };
    }

    return {
      success: true,
      data: stats,
    };
  }

  @Post('block/:ip')
  blockIP(
    @Param('ip') ip: string,
    @Body() body: { duration?: number }
  ) {
    const duration = body.duration || 30; // 30 minutos por defecto
    this.securityMonitoring.blockIP(ip, duration);
    
    return {
      success: true,
      message: `IP ${ip} bloqueada por ${duration} minutos`,
    };
  }

  @Post('unblock/:ip')
  unblockIP(@Param('ip') ip: string) {
    this.securityMonitoring.unblockIP(ip);
    
    return {
      success: true,
      message: `IP ${ip} desbloqueada`,
    };
  }
}
