import { Module } from '@nestjs/common';
import { FileValidationService } from './services/file-validation.service';
import { SecurityMonitoringService } from './services/security-monitoring.service';
import { SanitizationService } from './services/sanitization.service';

@Module({
  providers: [FileValidationService, SecurityMonitoringService, SanitizationService],
  exports: [FileValidationService, SecurityMonitoringService, SanitizationService],
})
export class CommonModule {}
