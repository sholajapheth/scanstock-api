import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { ValidationExceptionFilter } from './common/filters/validation-exception.filter';
import { ErrorInterceptor } from './common/interceptors/error.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    cors: true, // Enable CORS for mobile app
  });

  // Use Pino logger
  app.useLogger(app.get(Logger));

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global error handling
  app.useGlobalFilters(new ValidationExceptionFilter());
  app.useGlobalInterceptors(new ErrorInterceptor());

  // API prefix
  app.setGlobalPrefix('api');

  // Setup Swagger
  const config = new DocumentBuilder()
    .setTitle('ScanStock Pro API')
    .setDescription('The ScanStock Pro API documentation')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management endpoints')
    .addTag('products', 'Product management endpoints')
    .addTag('categories', 'Category management endpoints')
    .addTag('sales', 'Sales management endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Start server
  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`Application is running on: http://localhost:${port}/api`);
}

bootstrap();
