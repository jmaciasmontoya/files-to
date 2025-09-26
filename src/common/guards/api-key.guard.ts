import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { authConfig } from '../../config/auth.config';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const authType = this.reflector.get<string>('authType', context.getHandler());
    
    // Si no se especifica tipo de auth o es JWT, skip API key
    if (!authType || authType === 'jwt') {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'] || request.query.apiKey;

    if (!apiKey) {
      throw new UnauthorizedException('API Key requerida');
    }

    const isValidApiKey = authConfig.apiKey.keys.includes(apiKey);
    
    if (!isValidApiKey) {
      throw new UnauthorizedException('API Key inválida');
    }

    return true;
  }
}
