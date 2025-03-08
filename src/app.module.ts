import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { SalesModule } from './sales/sales.module';
import { LoggingMiddleware } from './logging/logging.middleware';
import { ActivitiesModule } from './activities/activities.module';
import { BusinessModule } from './business/business.module';
import { UpdatesModule } from './updates/updates.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            levelFirst: true,
            translateTime: 'yyyy-mm-dd HH:MM:ss',
            ignore: 'pid,hostname',
            messageFormat: '{msg} {req.method} {req.url} {res.statusCode}',
            errorLikeObjectKeys: ['err', 'error'],
            // Customize which keys to show and which to ignore
            customPrettifiers: {
              // Custom prettifiers if needed
            },
          },
        },
        level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
        // Define customProps for adding properties to all logs
        customProps: (req, res) => ({
          context: 'HTTP',
        }),
        // Control which requests to not log
        autoLogging: {
          ignore: (req) => req.url.includes('health'),
        },
        // Format the message in a custom way
        customLogLevel: (req, res, err) => {
          if (res.statusCode >= 500 || err) return 'error';
          if (res.statusCode >= 400) return 'warn';
          return 'info';
        },
        serializers: {
          req: (req) => ({
            method: req.method,
            url: req.url,
            // Sanitize sensitive data
            headers: {
              ...req.headers,
              authorization: req.headers.authorization
                ? '[REDACTED]'
                : undefined,
            },
            // Only include body in non-production environments
            body: process.env.NODE_ENV !== 'production' ? req.body : undefined,
          }),
          res: (res) => ({
            statusCode: res.statusCode,
          }),
          err: (err) => ({
            type: err.type,
            message: err.message,
            stack:
              process.env.NODE_ENV !== 'production' ? err.stack : undefined,
          }),
        },
      },
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'localadmin'),
        database: configService.get('DB_DATABASE', 'scanstock'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize:
          configService.get('NODE_ENV', 'development') === 'development',
        logging: configService.get('NODE_ENV', 'development') === 'development',
      }),
    }),
    AuthModule,
    UsersModule,
    ProductsModule,
    CategoriesModule,
    SalesModule,
    ActivitiesModule,
    BusinessModule,
    UpdatesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
