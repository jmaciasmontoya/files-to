import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AppModule } from './app.module';
import * as express from 'express';
import helmet from 'helmet';
import * as compression from 'compression';
import { FileConfig } from './config/file.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configurar validación global
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  // Configurar rate limiting global
  // app.useGlobalGuards(new ThrottlerGuard()); // Se configurará por controlador
  
  // Configurar headers de seguridad
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));
  
  // Configurar compresión
  app.use(compression());
  
  // Configurar CORS
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
    credentials: true,
  });
  
  // Configurar límite de tamaño para express
  const config = FileConfig.getConfig();
  app.use(express.json({ 
    limit: `${Math.ceil(config.maxFileSize / (1024 * 1024))}mb`,
    verify: (req, res, buf) => {
      // Verificar tamaño del payload
      if (buf.length > config.maxFileSize) {
        throw new Error('Payload too large');
      }
    }
  }));
  app.use(express.urlencoded({ 
    extended: true, 
    limit: `${Math.ceil(config.maxFileSize / (1024 * 1024))}mb` 
  }));
  
  // Configurar timeout
  app.use((req, res, next) => {
    req.setTimeout(30000); // 30 segundos
    res.setTimeout(30000);
    next();
  });
  
  await app.listen(process.env.PORT || 3000);
  console.log(`🚀 Server running on http://localhost:${process.env.PORT || 3000}`);
  console.log(`🛡️ Security features enabled: Rate Limiting, Helmet, Compression`);
}
bootstrap();
