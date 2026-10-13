import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // Clean initialization with no telemetry tracking
  const app = await NestFactory.create(AppModule);
  
  // Enforce DTO validation across all routes
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Automatically strips out any extra fields the user sends that aren't in your DTO
  }));
  
  await app.listen(3000);
}
bootstrap();