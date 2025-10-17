import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.enableCors({
    origin: ['*'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'Cache-Control',
    ]
  });

  // Swagger configuration - Se genera automáticamente en cada inicio
  const config = new DocumentBuilder()
    .setTitle('Cotizador API')
    .setDescription('API para el sistema de cotizaciones dinámicas con IA')
    .setVersion('1.0')
    .addTag('Products', '📦 Gestión de productos')
    .addTag('carts', '🛒 Operaciones de carritos de compras')
    .addTag('PaymentMethod', '💳 Métodos de pago')
    .addTag('CustomizationGroup', '⚙️ Campos de personalización')
    .addTag('CustomizationField', '⚙️ Campos de personalización')
    .build();

  // Generar documentación automáticamente
  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
    // Ordenar tags explícitamente
    deepScanRoutes: true,
  });

  // Configurar Swagger UI con opciones mejoradas
  SwaggerModule.setup('/docs', app, document, {
    customSiteTitle: 'Cotizador API Documentation',
    customfavIcon: '/favicon.ico',
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.js',
    ],
    customCssUrl: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
    ],
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
      docExpansion: 'list',
      defaultModelsExpandDepth: 2,
      defaultModelExpandDepth: 2,
    },
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
