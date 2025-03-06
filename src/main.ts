// import { NestFactory } from '@nestjs/core';
// import { ValidationPipe } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { Logger } from 'nestjs-pino';
// import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
// import { AppModule } from './app.module';
// import { LoggingInterceptor } from './logging/logging.interceptor';
// import { ErrorInterceptor } from './logging/error.interceptor';
// import { ValidationExceptionFilter } from './common/filters/validation-exception.filter';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule, { bufferLogs: true });
//   app.useLogger(app.get(Logger));

//   const configService = app.get(ConfigService);
//   // Get the PinoLogger instance for the filter and interceptor
//   const logger = app.get(Logger);

//   // Global validation pipe
//   app.useGlobalPipes(
//     new ValidationPipe({
//       whitelist: true,
//       transform: true,
//       forbidNonWhitelisted: true,
//       transformOptions: {
//         enableImplicitConversion: true,
//       },
//     }),
//   );

//   // Apply the validation filter
//   app.useGlobalFilters(new ValidationExceptionFilter(logger));

//   // Apply the error interceptor
//   app.useGlobalInterceptors(new ErrorInterceptor(logger));

//   // Enable CORS
//   app.enableCors({
//     origin: '*', // In production, replace with specific domains
//     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//     credentials: true,
//   });

//   // API prefix
//   app.setGlobalPrefix('api');

//   // Setup Swagger
//   const config = new DocumentBuilder()
//     .setTitle('ScanStock Pro API')
//     .setDescription('The ScanStock Pro API documentation')
//     .setVersion('1.0')
//     .addBearerAuth(
//       {
//         type: 'http',
//         scheme: 'bearer',
//         bearerFormat: 'JWT',
//         name: 'JWT',
//         description: 'Enter JWT token',
//         in: 'header',
//       },
//       'JWT-auth',
//     )
//     .addTag('auth', 'Authentication endpoints')
//     .addTag('users', 'User management endpoints')
//     .addTag('products', 'Product management endpoints')
//     .addTag('categories', 'Category management endpoints')
//     .addTag('sales', 'Sales management endpoints')
//     .build();

//   const document = SwaggerModule.createDocument(app, config);
//   SwaggerModule.setup('api/docs', app, document);

//   const port = configService.get<number>('PORT', 3000);
//   // Apply global interceptor
//   app.useGlobalInterceptors(new LoggingInterceptor(), new ErrorInterceptor());
//   await app.listen(port);

//   console.log(`ScanStock API is running on: http://localhost:${port}/api`);
//   console.log(
//     `Swagger documentation is available at: http://localhost:${port}/api/docs`,
//   );
// }
// bootstrap();

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { ValidationExceptionFilter } from './common/filters/validation-exception.filter';
import { ErrorInterceptor } from './common/interceptors/error.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

  // Global validation pipe with transform enabled
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Apply the validation filter & error interceptor
  // These now use their own logger instances
  app.useGlobalFilters(new ValidationExceptionFilter());
  app.useGlobalInterceptors(new ErrorInterceptor());

  // Enable CORS
  app.enableCors({
    origin: '*', // In production, replace with specific domains
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // API prefix
  app.setGlobalPrefix('api');

  const port = process.env.EXPO_PUBLIC_PORT || 3000;
  await app.listen(port);

  console.log(`Application is running on: http://localhost:${port}/api`);
}
bootstrap();
