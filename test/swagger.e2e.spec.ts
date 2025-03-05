import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

describe('Swagger Documentation (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

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

    const config = new DocumentBuilder()
      .setTitle('ScanStock Pro API')
      .setDescription('The ScanStock Pro API documentation')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/docs (GET) - should return the Swagger UI HTML', () => {
    return request(app.getHttpServer())
      .get('/api/docs')
      .expect(200)
      .expect('Content-Type', /html/)
      .expect((res) => {
        expect(res.text).toContain('swagger-ui');
        expect(res.text).toContain('ScanStock Pro API');
      });
  });

  it('/api/docs-json (GET) - should return the Swagger JSON schema', () => {
    return request(app.getHttpServer())
      .get('/api/docs-json')
      .expect(200)
      .expect('Content-Type', /json/)
      .expect((res) => {
        expect(res.body.info.title).toBe('ScanStock Pro API');
        expect(res.body.paths).toBeDefined();
        expect(res.body.components.schemas).toBeDefined();

        // Check that our main endpoints are documented
        expect(res.body.paths['/auth/login']).toBeDefined();
        expect(res.body.paths['/auth/register']).toBeDefined();
        expect(res.body.paths['/products']).toBeDefined();
        expect(res.body.paths['/categories']).toBeDefined();
        expect(res.body.paths['/sales']).toBeDefined();
      });
  });
});
