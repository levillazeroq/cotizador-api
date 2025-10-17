import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS - Allow all origins for now
  app.enableCors({
    origin: true, // Esto permite cualquier origen
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'X-Requested-With',
      'Cache-Control',
    ],
    exposedHeaders: ['Content-Length', 'Content-Type'],
    credentials: false, // Importante: false cuando se permite cualquier origen
    maxAge: 3600, // Cache preflight request por 1 hora
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
