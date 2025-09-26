import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('test-token')
  async generateTestToken() {
    // Generar token de prueba para testing
    const testUser = {
      userId: 'test-user-123',
      username: 'test-user'
    };
    
    return await this.authService.generateToken(testUser);
  }
}
