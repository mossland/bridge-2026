import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // CORS 설정
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });
  
  // Validation 파이프
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );
  
  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  console.log(`🚀 BRIDGE 2026 API Server running on http://localhost:${port}`);
  console.log(`📡 Endpoints:`);
  console.log(`   - GET  /health              - Health check`);
  console.log(`   - GET  /api/signals         - List signals`);
  console.log(`   - POST /api/signals/collect - Collect signals`);
  console.log(`   - GET  /api/proposals       - List proposals`);
  console.log(`   - GET  /api/proposals/:id   - Get proposal`);
  console.log(`   - POST /api/proposals/:id/vote  - Cast vote`);
  console.log(`   - GET  /api/delegation/policies  - List delegation policies`);
  console.log(`   - POST /api/delegation/policies  - Create delegation policy`);
  console.log(`   - GET  /api/outcomes        - List outcomes`);
}

bootstrap();




