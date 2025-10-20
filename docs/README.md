# 📚 Documentación del Proyecto

Bienvenido a la documentación completa del **Cotizador Dinámico API**.

## 📋 Índice de Documentación

### 🚀 Inicio Rápido

- **[README.md](../README.md)** - Guía principal del proyecto
  - Instalación y configuración
  - Comandos básicos
  - Estructura del proyecto
  - Scripts disponibles

### 📖 API Reference

- **[API.md](./API.md)** - Documentación detallada de endpoints
  - Todos los endpoints con ejemplos
  - Formatos de request/response
  - Códigos de estado HTTP
  - Guías de integración

- **[EXAMPLES.http](./EXAMPLES.http)** - Colección de ejemplos
  - 50+ ejemplos de requests
  - Casos de uso comunes
  - Flujos completos
  - Compatible con REST Client (VS Code)

- **[Swagger UI](http://localhost:3000/docs)** - Documentación interactiva
  - Interfaz interactiva
  - Prueba endpoints en vivo
  - Esquemas de datos
  - Generación automática

### 🏗️ Arquitectura

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Diseño del sistema
  - Diagramas de arquitectura
  - Capas y módulos
  - Patrones de diseño
  - Flujo de peticiones
  - Estrategia de escalabilidad

### 🤝 Contribución

- **[CONTRIBUTING.md](../CONTRIBUTING.md)** - Guía de contribución
  - Código de conducta
  - Proceso de desarrollo
  - Estándares de código
  - Commits y Pull Requests
  - Cómo reportar bugs

### 📝 Changelog

- **[CHANGELOG.md](../CHANGELOG.md)** - Historial de cambios
  - Versiones publicadas
  - Nuevas características
  - Correcciones de bugs
  - Cambios importantes

## 🎯 Rutas Rápidas

### Para Desarrolladores Nuevos

1. Empieza con el [README.md](../README.md) para configurar tu entorno
2. Revisa [ARCHITECTURE.md](./ARCHITECTURE.md) para entender la estructura
3. Lee [CONTRIBUTING.md](../CONTRIBUTING.md) antes de hacer cambios
4. Usa [EXAMPLES.http](./EXAMPLES.http) para probar la API

### Para Integradores

1. Lee [API.md](./API.md) para conocer todos los endpoints
2. Abre [Swagger UI](http://localhost:3000/docs) para pruebas interactivas
3. Usa [EXAMPLES.http](./EXAMPLES.http) como referencia
4. Consulta la sección de ejemplos de integración

### Para Maintainers

1. Actualiza [CHANGELOG.md](../CHANGELOG.md) en cada release
2. Revisa [CONTRIBUTING.md](../CONTRIBUTING.md) periódicamente
3. Mantén [ARCHITECTURE.md](./ARCHITECTURE.md) actualizado
4. Actualiza [API.md](./API.md) cuando agregues endpoints

## 📚 Documentación por Módulo

### 🛒 Carritos (Carts)

**Endpoints**:
- `GET /cart` - Listar cotizaciones
- `GET /cart/:id` - Obtener carrito
- `POST /cart` - Crear carrito
- `PUT /cart/:id` - Actualizar carrito
- `PATCH /cart/:id/customization` - Actualizar personalizaciones

**WebSocket**: Actualizaciones en tiempo real del carrito

**Documentación**: [API.md - Carritos](./API.md#carritos-carts)

### 📦 Productos (Products)

**Endpoints**:
- `GET /products` - Listar productos
- `GET /products/:id` - Obtener producto
- `POST /products` - Crear producto
- `PUT /products/:id` - Actualizar producto
- `DELETE /products/:id` - Eliminar producto
- `POST /products/upload` - Importar productos

**Documentación**: [API.md - Productos](./API.md#productos-products)

### 💳 Métodos de Pago (Payment Methods)

**Endpoints**:
- `GET /payment-methods` - Listar métodos
- `GET /payment-methods/:id` - Obtener método
- `POST /payment-methods` - Crear método
- `PATCH /payment-methods/:id` - Actualizar método
- `DELETE /payment-methods/:id` - Eliminar método
- `PATCH /payment-methods/:id/toggle-active` - Activar/Desactivar
- `POST /payment-methods/reorder` - Reordenar

**Documentación**: [API.md - Métodos de Pago](./API.md#métodos-de-pago-payment-methods)

### 📋 Grupos de Personalización (Customization Groups)

**Endpoints**:
- `GET /customization-groups` - Listar grupos
- `GET /customization-groups/active` - Listar activos
- `GET /customization-groups/:id` - Obtener grupo
- `POST /customization-groups` - Crear grupo
- `PATCH /customization-groups/:id` - Actualizar grupo
- `DELETE /customization-groups/:id` - Eliminar grupo
- `PATCH /customization-groups/:id/toggle-active` - Activar/Desactivar
- `POST /customization-groups/reorder` - Reordenar

**Documentación**: [API.md - Grupos de Personalización](./API.md#grupos-de-personalización-customization-groups)

### 🎨 Campos de Personalización (Customization Fields)

**Endpoints**:
- `GET /customization-fields` - Listar campos
- `GET /customization-fields?groupId=xxx` - Filtrar por grupo
- `GET /customization-fields/:id` - Obtener campo
- `POST /customization-fields` - Crear campo
- `PATCH /customization-fields/:id` - Actualizar campo
- `DELETE /customization-fields/:id` - Eliminar campo
- `PATCH /customization-fields/:id/toggle-active` - Activar/Desactivar
- `POST /customization-fields/reorder` - Reordenar

**Tipos de Campo**: text, textarea, number, select, checkbox, radio

**Documentación**: [API.md - Campos de Personalización](./API.md#campos-de-personalización-customization-fields)

### 📊 Inventario (Inventory)

**Endpoints**:
- `GET /inventory` - Obtener inventario
- `GET /inventory/aggregated` - Inventario agregado
- `PUT /inventory` - Actualizar inventario

**Filtros**: product_id, location_id, sku, minStock, inStock

**Documentación**: [API.md - Inventario](./API.md#inventario-inventory)

## 🔌 WebSockets

**URL**: `ws://localhost:3000`

**Eventos Cliente → Servidor**:
- `cart:subscribe` - Suscribirse a carrito
- `cart:get` - Obtener estado
- `cart:update` - Actualizar carrito

**Eventos Servidor → Cliente**:
- `cart:updated` - Carrito actualizado
- `cart:item-added` - Item agregado
- `cart:item-removed` - Item removido
- `cart:error` - Error

**Documentación**: [API.md - WebSockets](./API.md#websockets)

## 🛠️ Stack Tecnológico

| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| NestJS | ^10.0.0 | Framework backend |
| TypeScript | ^5.1.3 | Lenguaje de programación |
| PostgreSQL | ^14 | Base de datos |
| Drizzle ORM | ^0.44.6 | ORM |
| Socket.IO | ^4.8.1 | WebSockets |
| Swagger | ^11.2.0 | Documentación |
| class-validator | ^0.14.0 | Validación |
| Axios | ^1.12.2 | HTTP Client |

## 📝 Convenciones

### Naming Conventions

- **Files**: kebab-case (e.g., `cart.controller.ts`)
- **Classes**: PascalCase (e.g., `CartController`)
- **Functions**: camelCase (e.g., `getCartById`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_RETRIES`)

### Commit Messages

Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(cart): add customization endpoint
fix(products): correct price filter bug
docs(readme): update installation steps
```

### Code Style

- TypeScript strict mode
- ESLint + Prettier
- 2 spaces para indentación
- Single quotes
- No semicolons (en TypeScript)

## 🧪 Testing

### Ejecutar Tests

```bash
# Unit tests
pnpm run test

# E2E tests
pnpm run test:e2e

# Coverage
pnpm run test:cov
```

### Cobertura Objetivo

- Unit tests: > 80%
- E2E tests: Flujos críticos
- Integration tests: Endpoints principales

## 🚀 Deployment

### Ambientes

- **Development**: Local development
- **Staging**: Pre-production testing
- **Production**: Live environment

### CI/CD (Planeado)

- GitHub Actions
- Automated tests
- Docker builds
- Deployment automation

## 📞 Soporte

### Canales de Comunicación

- **GitHub Issues**: Para bugs y feature requests
- **Pull Requests**: Para contribuciones de código
- **Email**: support@example.com

### Recursos Útiles

- [NestJS Docs](https://docs.nestjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

## 🗺️ Roadmap

### v1.1 (Próximo)

- [ ] Autenticación con JWT
- [ ] Sistema de permisos
- [ ] Rate limiting
- [ ] API versioning

### v1.2 (Futuro)

- [ ] Cache con Redis
- [ ] Queue system con Bull
- [ ] Logs estructurados
- [ ] Monitoreo con Prometheus

### v2.0 (Futuro)

- [ ] GraphQL API
- [ ] Microservices architecture
- [ ] Event sourcing
- [ ] CQRS pattern

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver [LICENSE](../LICENSE) para más detalles.

## 🙏 Agradecimientos

Gracias a todos los contribuidores y a la comunidad de código abierto.

---

**Última actualización**: Enero 2025  
**Versión de la API**: 1.0.0

---

## 🔍 Búsqueda Rápida

**¿Buscas algo específico?**

- **Cómo instalar**: [README.md - Instalación](../README.md#instalación)
- **Todos los endpoints**: [API.md](./API.md)
- **Ejemplos de código**: [EXAMPLES.http](./EXAMPLES.http)
- **Arquitectura**: [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Contribuir**: [CONTRIBUTING.md](../CONTRIBUTING.md)
- **Versiones**: [CHANGELOG.md](../CHANGELOG.md)
- **Swagger**: [http://localhost:3000/docs](http://localhost:3000/docs)

