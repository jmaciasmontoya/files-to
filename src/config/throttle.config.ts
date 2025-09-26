import { ThrottlerModuleOptions } from '@nestjs/throttler';

export const throttleConfig: ThrottlerModuleOptions = {
  throttlers: [
    {
      name: 'short',
      ttl: 1000, // 1 segundo
      limit: 3, // 3 requests por segundo
    },
    {
      name: 'medium',
      ttl: 10000, // 10 segundos
      limit: 20, // 20 requests por 10 segundos
    },
    {
      name: 'long',
      ttl: 60000, // 1 minuto
      limit: 100, // 100 requests por minuto
    },
    {
      name: 'upload',
      ttl: 60000, // 1 minuto
      limit: 10, // 10 uploads por minuto
    },
    {
      name: 'auth',
      ttl: 300000, // 5 minutos
      limit: 5, // 5 intentos de auth por 5 minutos
    }
  ],
  errorMessage: 'Demasiadas solicitudes. Por favor, intenta de nuevo más tarde.',
};
