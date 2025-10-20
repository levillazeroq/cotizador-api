# 🏗️ Arquitectura del Sistema

## Visión General

Cotizador Dinámico API es una aplicación backend construida con **NestJS** que sigue una arquitectura modular y escalable, diseñada para gestionar cotizaciones dinámicas de productos con personalización.

## Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                         Cliente (Frontend)                       │
│                    React / Next.js / Vue / etc.                  │
└───────────────────┬─────────────────────┬───────────────────────┘
                    │                     │
                    │ HTTP/REST          │ WebSocket
                    │                     │
┌───────────────────▼─────────────────────▼───────────────────────┐
│                         API Gateway Layer                        │
│                      (NestJS Controllers)                        │
├──────────────────────────────────────────────────────────────────┤
│  CartController │ ProductsController │ PaymentMethodController  │
│  CustomizationGroupController │ InventoryController            │
└───────────────────┬─────────────────────┬───────────────────────┘
                    │                     │
                    │ DTO Validation     │ WebSocket Events
                    │                     │
┌───────────────────▼─────────────────────▼───────────────────────┐
│                       Service Layer                              │
│                    (Business Logic)                              │
├──────────────────────────────────────────────────────────────────┤
│    CartService │ ProductsService │ PaymentMethodService         │
│    CustomizationService │ InventoryService                      │
└───────────────────┬─────────────────────┬───────────────────────┘
                    │                     │
                    │                     │
┌───────────────────▼─────────────────────▼───────────────────────┐
│                    Repository Layer                              │
│                  (Data Access Logic)                             │
├──────────────────────────────────────────────────────────────────┤
│  CartRepository │ PaymentMethodRepository                       │
│  CustomizationGroupRepository │ CustomizationFieldRepository   │
└───────────────────┬─────────────────────┬───────────────────────┘
                    │                     │
                    │ Drizzle ORM        │ HTTP Client
                    │                     │
┌───────────────────▼─────────────────────▼───────────────────────┐
│                    Data Layer                                    │
├──────────────────────────────────────────────────────────────────┤
│        PostgreSQL Database    │    External APIs                │
│                               │    (Products, Inventory)         │
└───────────────────────────────┴──────────────────────────────────┘
```

## Capas de la Arquitectura

### 1. Presentation Layer (Controllers & Gateways)

**Responsabilidad**: Manejar peticiones HTTP y conexiones WebSocket.

**Componentes**:
- **Controllers**: Endpoints REST
- **Gateways**: Conexiones WebSocket
- **DTOs**: Validación de entrada/salida

**Características**:
- Validación automática con `class-validator`
- Documentación automática con Swagger
- Manejo de errores HTTP
- Transformación de respuestas

### 2. Business Logic Layer (Services)

**Responsabilidad**: Implementar la lógica de negocio.

**Componentes**:
- Services: Lógica específica del dominio
- Validaciones de negocio
- Transformaciones de datos
- Coordinación entre repositorios

**Características**:
- Independiente de la capa de presentación
- Testeable de forma aislada
- Reutilizable entre controladores y gateways

### 3. Data Access Layer (Repositories)

**Responsabilidad**: Gestionar el acceso a datos.

**Componentes**:
- Repositories: Queries a la base de datos
- External API Clients: Comunicación con APIs externas
- Drizzle ORM: Abstracción de base de datos

**Características**:
- Queries tipadas con TypeScript
- Migraciones automáticas
- Conexión pooling
- Transacciones

### 4. Data Layer

**Responsabilidad**: Almacenamiento persistente.

**Componentes**:
- PostgreSQL: Base de datos principal
- External Services: APIs de productos e inventario

## Módulos Principales

### Cart Module

**Propósito**: Gestión de carritos y cotizaciones.

**Componentes**:
```
carts/
├── dto/
│   ├── create-cart.dto.ts
│   ├── update-cart.dto.ts
│   └── update-customization.dto.ts
├── cart.controller.ts       # REST endpoints
├── cart.gateway.ts          # WebSocket events
├── cart.service.ts          # Business logic
├── cart.repository.ts       # Database access
└── cart.module.ts           # Module definition
```

**Responsabilidades**:
- CRUD de carritos
- Gestión de items
- Cálculo de totales
- Actualizaciones en tiempo real

### Products Module

**Propósito**: Integración con sistema externo de productos.

**Componentes**:
```
products/
├── products.controller.ts   # REST endpoints
├── products.service.ts      # External API client
└── products.module.ts       # Module definition
```

**Responsabilidades**:
- Proxy a API externa
- Cache de productos (futuro)
- Transformación de datos

### Payment Methods Module

**Propósito**: Gestión de métodos de pago.

**Componentes**:
```
payment-methods/
├── dto/
├── payment-method.controller.ts
├── payment-method.service.ts
├── payment-method.repository.ts
└── payment-method.module.ts
```

**Responsabilidades**:
- CRUD de métodos de pago
- Configuración de cuotas
- Cálculo de intereses

### Customization Module

**Propósito**: Sistema flexible de personalización.

**Componentes**:
```
customization-groups/        # Grupos de personalización
customization-fields/        # Campos individuales
```

**Responsabilidades**:
- Definición de campos personalizables
- Organización en grupos
- Validación de valores

### Inventory Module

**Propósito**: Gestión de inventario.

**Componentes**:
```
inventory/
├── inventory.controller.ts
├── inventory.service.ts
└── inventory.module.ts
```

**Responsabilidades**:
- Consulta de stock
- Actualizaciones de inventario
- Integración con sistema externo

## Patrones de Diseño

### 1. Dependency Injection

NestJS usa DI nativamente para gestionar dependencias.

```typescript
@Injectable()
export class CartService {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly productsService: ProductsService,
  ) {}
}
```

**Beneficios**:
- Bajo acoplamiento
- Facilita testing
- Código más limpio

### 2. Repository Pattern

Abstrae el acceso a datos.

```typescript
@Injectable()
export class CartRepository {
  async findById(id: string): Promise<Cart> {
    return await db.query.carts.findFirst({
      where: eq(carts.id, id),
      with: { items: true }
    });
  }
}
```

**Beneficios**:
- Lógica de datos centralizada
- Fácil cambio de ORM
- Queries reutilizables

### 3. DTO Pattern

Valida y transforma datos.

```typescript
export class CreateCartDto {
  @IsString()
  @IsNotEmpty()
  conversationId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCartItemDto)
  items: CreateCartItemDto[];
}
```

**Beneficios**:
- Validación automática
- Documentación de tipos
- Transformación de datos

### 4. Module Pattern

Organiza el código en módulos cohesivos.

```typescript
@Module({
  imports: [DatabaseModule],
  controllers: [CartController],
  providers: [CartService, CartRepository, CartGateway],
  exports: [CartService],
})
export class CartModule {}
```

**Beneficios**:
- Separación de concerns
- Carga lazy (futuro)
- Reutilización de módulos

## Flujo de una Petición

### REST Request Flow

```
1. Cliente → HTTP Request
   ↓
2. Controller → Recibe request, valida DTOs
   ↓
3. Service → Ejecuta lógica de negocio
   ↓
4. Repository → Consulta base de datos
   ↓
5. Database → Retorna datos
   ↓
6. Service → Transforma datos
   ↓
7. Controller → Formatea response
   ↓
8. Cliente ← HTTP Response
```

### WebSocket Event Flow

```
1. Cliente → Emite evento via WebSocket
   ↓
2. Gateway → Recibe evento
   ↓
3. Service → Procesa evento
   ↓
4. Repository → Actualiza base de datos
   ↓
5. Gateway → Emite evento a clientes suscritos
   ↓
6. Clientes ← Reciben actualización en tiempo real
```

## Manejo de Errores

### Jerarquía de Excepciones

```typescript
// NestJS Exceptions
HttpException
  ├── BadRequestException (400)
  ├── UnauthorizedException (401)
  ├── NotFoundException (404)
  ├── ConflictException (409)
  └── InternalServerErrorException (500)
```

### Filtros de Excepción

```typescript
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus();

    response.status(status).json({
      statusCode: status,
      message: exception.message,
      timestamp: new Date().toISOString(),
    });
  }
}
```

## Seguridad

### Validación de Entrada

- DTOs con `class-validator`
- Sanitización automática
- Validación de tipos

### Base de Datos

- Queries parametrizadas (Drizzle ORM)
- Protección contra SQL injection
- Validación de constraints

### CORS

```typescript
app.enableCors({
  origin: ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true,
});
```

## Escalabilidad

### Horizontal Scaling

La API es stateless y puede escalarse horizontalmente:

```
┌──────────────┐
│ Load Balancer│
└──────┬───────┘
       │
   ────┼────────────────────
   │   │   │               │
┌──▼───▼───▼───┐    ┌──────▼───────┐
│ API Instance │    │ API Instance │
│   (Node 1)   │    │   (Node 2)   │
└──────┬───────┘    └──────┬───────┘
       │                   │
       └───────┬───────────┘
               │
        ┌──────▼───────┐
        │  PostgreSQL  │
        └──────────────┘
```

### Optimizaciones Futuras

1. **Caching**
   - Redis para datos frecuentes
   - Cache de productos
   - Cache de configuración

2. **Queue System**
   - Bull/BullMQ para jobs
   - Procesamiento async
   - Retry logic

3. **Database**
   - Read replicas
   - Connection pooling
   - Query optimization

4. **API Gateway**
   - Rate limiting
   - Request throttling
   - API versioning

## Testing Strategy

### Pirámide de Tests

```
       ┌─────┐
       │ E2E │
       └─────┘
      ┌───────┐
      │ Integ │
      └───────┘
    ┌──────────┐
    │   Unit   │
    └──────────┘
```

### Unit Tests

```typescript
describe('CartService', () => {
  it('should calculate cart total correctly', () => {
    const cart = {
      items: [
        { price: 1000, quantity: 2 },
        { price: 500, quantity: 1 },
      ],
    };
    
    const total = service.calculateTotal(cart);
    
    expect(total).toBe(2500);
  });
});
```

### Integration Tests

```typescript
describe('CartController (integration)', () => {
  it('GET /cart/:id should return cart', async () => {
    const response = await request(app.getHttpServer())
      .get('/cart/cart_123')
      .expect(200);
    
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('items');
  });
});
```

### E2E Tests

```typescript
describe('Complete cart flow (E2E)', () => {
  it('should create cart, add items, and checkout', async () => {
    // Create cart
    const cart = await createCart();
    
    // Add items
    await addItemToCart(cart.id);
    
    // Update customizations
    await updateCustomizations(cart.id);
    
    // Verify final state
    const final = await getCart(cart.id);
    expect(final.totalItems).toBe(1);
  });
});
```

## Monitoreo y Observabilidad

### Logs

```typescript
@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);

  async createCart(dto: CreateCartDto) {
    this.logger.log(`Creating cart for conversation: ${dto.conversationId}`);
    // ...
  }
}
```

### Métricas (Futuro)

- Prometheus para métricas
- Grafana para visualización
- Alertas en tiempo real

### Tracing (Futuro)

- OpenTelemetry
- Jaeger para distributed tracing
- Performance monitoring

## Deployment

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY dist ./dist
EXPOSE 3000
CMD ["node", "dist/main"]
```

### Kubernetes (Futuro)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cotizador-api
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: api
        image: cotizador-api:1.0.0
        ports:
        - containerPort: 3000
```

## Mejores Prácticas

### 1. Separation of Concerns

Cada capa tiene una responsabilidad específica.

### 2. DRY (Don't Repeat Yourself)

Reutiliza código a través de servicios compartidos.

### 3. SOLID Principles

- **S**ingle Responsibility
- **O**pen/Closed
- **L**iskov Substitution
- **I**nterface Segregation
- **D**ependency Inversion

### 4. Clean Code

- Nombres descriptivos
- Funciones pequeñas
- Comentarios cuando sea necesario
- Código auto-documentado

### 5. Type Safety

TypeScript en todas partes para seguridad de tipos.

---

## Referencias

- [NestJS Architecture](https://docs.nestjs.com/first-steps)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Twelve-Factor App](https://12factor.net/)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)

---

**Última actualización**: Enero 2025  
**Versión**: 1.0.0

