# 📖 Documentación Detallada de la API

## Índice

- [Introducción](#introducción)
- [Autenticación](#autenticación)
- [Formato de Respuestas](#formato-de-respuestas)
- [Códigos de Estado](#códigos-de-estado)
- [Carritos (Carts)](#carritos-carts)
- [Productos (Products)](#productos-products)
- [Métodos de Pago (Payment Methods)](#métodos-de-pago-payment-methods)
- [Grupos de Personalización (Customization Groups)](#grupos-de-personalización-customization-groups)
- [Campos de Personalización (Customization Fields)](#campos-de-personalización-customization-fields)
- [Inventario (Inventory)](#inventario-inventory)
- [WebSockets](#websockets)
- [Ejemplos de Integración](#ejemplos-de-integración)

---

## Introducción

La API de Cotizador Dinámico es una API REST construida con NestJS que proporciona endpoints para gestionar todo el ciclo de vida de cotizaciones, desde la selección de productos hasta la configuración de métodos de pago.

**URL Base**: `http://localhost:3000`  
**Documentación Interactiva**: `http://localhost:3000/docs`

## Autenticación

Actualmente la API no requiere autenticación. En futuras versiones se implementará:

- JWT Authentication
- API Keys
- OAuth 2.0

## Formato de Respuestas

### Respuesta Exitosa

```json
{
  "id": "resource_123456",
  "name": "Example Resource",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

### Respuesta de Error

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    {
      "field": "name",
      "error": "name should not be empty"
    }
  ]
}
```

## Códigos de Estado

| Código | Significado | Descripción |
|--------|-------------|-------------|
| `200` | OK | Solicitud exitosa |
| `201` | Created | Recurso creado exitosamente |
| `204` | No Content | Operación exitosa sin contenido de retorno |
| `400` | Bad Request | Datos inválidos o error de validación |
| `404` | Not Found | Recurso no encontrado |
| `500` | Internal Server Error | Error del servidor |

---

## Carritos (Carts)

### Listar Todas las Cotizaciones

Obtiene una lista de todos los carritos/cotizaciones con información resumida.

**Endpoint**: `GET /cart`

**Respuesta**: `200 OK`

```json
[
  {
    "id": "cart_123456",
    "conversationId": "conv_abc123xyz",
    "totalItems": 3,
    "totalPrice": 1349990,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T14:45:00.000Z",
    "displayName": "Cotización #123456",
    "lastUpdated": "15 ene 2024, 14:45"
  }
]
```

---

### Obtener Carrito por ID

Retorna un carrito específico con todos sus items.

**Endpoint**: `GET /cart/:id`

**Parámetros de URL**:
- `id` (string, requerido): ID del carrito

**Ejemplo**: `GET /cart/cart_123456`

**Respuesta**: `200 OK`

```json
{
  "id": "cart_123456",
  "conversationId": "conv_abc123xyz",
  "items": [
    {
      "id": "item_789",
      "cartId": "cart_123456",
      "productId": "prod_123456",
      "name": "Laptop Dell XPS 13",
      "sku": "DELL-XPS13-2024",
      "size": "13 pulgadas",
      "color": "Plata",
      "price": 1299990,
      "quantity": 1,
      "imageUrl": "https://example.com/images/laptop.jpg",
      "maxStock": 10,
      "customizationValues": {
        "field-1": "Logo personalizado",
        "field-2": "Azul"
      },
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "totalItems": 3,
  "totalPrice": 1349990,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T14:45:00.000Z"
}
```

**Errores**:
- `404`: Carrito no encontrado

---

### Obtener Carrito por Conversation ID

Busca un carrito asociado a un ID de conversación específico.

**Endpoint**: `GET /cart/conversation/:conversationId`

**Parámetros de URL**:
- `conversationId` (string, requerido): ID de la conversación

**Ejemplo**: `GET /cart/conversation/conv_abc123xyz`

**Respuesta**: `200 OK` (mismo formato que obtener por ID)

**Errores**:
- `404`: Carrito no encontrado para esa conversación

---

### Crear Carrito

Crea un nuevo carrito/cotización asociado a una conversación.

**Endpoint**: `POST /cart`

**Body**:

```json
{
  "conversationId": "conv_abc123xyz",
  "items": [
    {
      "productId": "prod_123456",
      "name": "Laptop Dell XPS 13",
      "sku": "DELL-XPS13-2024",
      "price": 1299990,
      "quantity": 1,
      "size": "13 pulgadas",
      "color": "Plata",
      "imageUrl": "https://example.com/images/laptop.jpg"
    }
  ]
}
```

**Respuesta**: `201 Created`

```json
{
  "id": "cart_123456",
  "conversationId": "conv_abc123xyz",
  "items": [...],
  "totalItems": 1,
  "totalPrice": 1299990,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Errores**:
- `400`: Datos inválidos

---

### Actualizar Carrito

Actualiza un carrito existente reemplazando todos sus items.

**Endpoint**: `PUT /cart/:id`

**Parámetros de URL**:
- `id` (string, requerido): ID del carrito

**Body**:

```json
{
  "items": [
    {
      "productId": "prod_123456",
      "name": "Laptop Dell XPS 13",
      "sku": "DELL-XPS13-2024",
      "price": 1299990,
      "quantity": 2,
      "size": "13 pulgadas",
      "color": "Plata"
    }
  ]
}
```

**Respuesta**: `200 OK`

**Errores**:
- `404`: Carrito no encontrado
- `400`: Datos inválidos

---

### Actualizar Personalización

Actualiza los valores de personalización de los productos en un carrito.

**Endpoint**: `PATCH /cart/:id/customization`

**Parámetros de URL**:
- `id` (string, requerido): ID del carrito

**Body**:

```json
{
  "itemUpdates": [
    {
      "itemId": "item_789",
      "customizationValues": {
        "field-1": "Logo personalizado ABC",
        "field-2": "Azul Marino"
      }
    }
  ]
}
```

**Respuesta**: `200 OK`

```json
{
  "id": "cart_123456",
  "items": [
    {
      "id": "item_789",
      "productId": "prod_123456",
      "name": "Laptop Dell XPS 13",
      "customizationValues": {
        "field-1": "Logo personalizado ABC",
        "field-2": "Azul Marino"
      },
      "price": 1299990
    }
  ],
  "totalItems": 1,
  "totalPrice": 1299990
}
```

---

## Productos (Products)

### Listar Productos

Obtiene una lista de productos con soporte para filtrado y paginación.

**Endpoint**: `GET /products`

**Query Parameters**:
- `search` (string, opcional): Búsqueda por nombre o descripción
- `category` (string, opcional): Filtrar por categoría
- `minPrice` (number, opcional): Precio mínimo
- `maxPrice` (number, opcional): Precio máximo
- `page` (number, opcional): Número de página (default: 1)
- `limit` (number, opcional): Items por página (default: 20)
- `sortBy` (string, opcional): Campo de ordenamiento
- `sortOrder` (string, opcional): 'asc' o 'desc'

**Ejemplo**: `GET /products?category=Laptops&minPrice=1000000&maxPrice=2000000&page=1&limit=20`

**Respuesta**: `200 OK`

```json
{
  "data": [
    {
      "id": "prod_123456",
      "name": "Laptop Dell XPS 13",
      "description": "Laptop ultradelgada con procesador Intel i7",
      "price": 1299990,
      "category": "Laptops",
      "sku": "DELL-XPS13-2024",
      "stock": 15,
      "imageUrl": "https://example.com/images/laptop.jpg",
      "variants": [
        {
          "name": "Color",
          "options": ["Plata", "Negro", "Oro"]
        },
        {
          "name": "Tamaño",
          "options": ["13 pulgadas", "15 pulgadas"]
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

### Obtener Producto por ID

Retorna un producto específico con todos sus detalles.

**Endpoint**: `GET /products/:id`

**Parámetros de URL**:
- `id` (string, requerido): ID del producto

**Ejemplo**: `GET /products/prod_123456`

**Respuesta**: `200 OK`

```json
{
  "id": "prod_123456",
  "name": "Laptop Dell XPS 13",
  "description": "Laptop ultradelgada con procesador Intel i7",
  "longDescription": "Descripción detallada del producto con especificaciones completas...",
  "price": 1299990,
  "category": "Laptops",
  "sku": "DELL-XPS13-2024",
  "stock": 15,
  "imageUrl": "https://example.com/images/laptop.jpg",
  "images": [
    "https://example.com/images/laptop-1.jpg",
    "https://example.com/images/laptop-2.jpg",
    "https://example.com/images/laptop-3.jpg"
  ],
  "variants": [
    {
      "id": "variant_1",
      "name": "Color",
      "options": [
        {
          "value": "Plata",
          "priceModifier": 0,
          "available": true
        },
        {
          "value": "Negro",
          "priceModifier": 0,
          "available": true
        }
      ]
    }
  ],
  "specifications": {
    "processor": "Intel Core i7-1185G7",
    "ram": "16GB LPDDR4x",
    "storage": "512GB NVMe SSD",
    "display": "13.4\" FHD+ (1920x1200)",
    "graphics": "Intel Iris Xe Graphics",
    "battery": "52WHr",
    "weight": "1.2kg"
  },
  "brand": "Dell",
  "createdAt": "2024-01-10T08:00:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Errores**:
- `404`: Producto no encontrado

---

### Crear Producto

Registra un nuevo producto en el catálogo.

**Endpoint**: `POST /products`

**Body**:

```json
{
  "name": "Laptop Dell XPS 13",
  "description": "Laptop ultradelgada con procesador Intel i7",
  "longDescription": "Descripción detallada...",
  "price": 1299990,
  "category": "Laptops",
  "sku": "DELL-XPS13-2024",
  "stock": 15,
  "imageUrl": "https://example.com/images/laptop.jpg",
  "images": ["url1", "url2", "url3"],
  "brand": "Dell",
  "variants": [],
  "specifications": {}
}
```

**Campos Requeridos**:
- `name` (string)
- `price` (number)
- `category` (string)
- `sku` (string)

**Respuesta**: `201 Created`

**Errores**:
- `400`: Datos inválidos o SKU duplicado

---

### Actualizar Producto

Actualiza un producto existente.

**Endpoint**: `PUT /products/:id`

**Parámetros de URL**:
- `id` (string, requerido): ID del producto

**Body**: (Campos a actualizar)

```json
{
  "name": "Laptop Dell XPS 13 (Actualizado)",
  "price": 1399990,
  "stock": 20
}
```

**Respuesta**: `200 OK`

**Errores**:
- `404`: Producto no encontrado
- `400`: Datos inválidos

---

### Eliminar Producto

Elimina un producto del catálogo.

**Endpoint**: `DELETE /products/:id`

**Parámetros de URL**:
- `id` (string, requerido): ID del producto

**Respuesta**: `204 No Content`

**Errores**:
- `404`: Producto no encontrado

---

### Cargar Productos desde Archivo

Importa productos masivamente desde un archivo CSV o Excel.

**Endpoint**: `POST /products/upload`

**Content-Type**: `multipart/form-data`

**Form Data**:
- `file` (file, requerido): Archivo CSV o Excel

**Respuesta**: `201 Created`

```json
{
  "success": true,
  "imported": 150,
  "errors": [],
  "message": "150 productos importados exitosamente"
}
```

**Errores**:
- `400`: Archivo inválido o formato incorrecto

---

## Métodos de Pago (Payment Methods)

### Listar Métodos de Pago

Obtiene todos los métodos de pago configurados.

**Endpoint**: `GET /payment-methods`

**Respuesta**: `200 OK`

```json
[
  {
    "id": "pm_123456",
    "name": "Tarjeta de Crédito",
    "type": "credit_card",
    "description": "Pago con tarjetas Visa, Mastercard, AMEX",
    "isActive": true,
    "displayOrder": 1,
    "maxInstallments": 12,
    "installmentInterest": 2.5,
    "discount": 0,
    "surcharge": 0,
    "icon": "credit-card-icon.svg",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "pm_789012",
    "name": "Transferencia Bancaria",
    "type": "bank_transfer",
    "description": "Transferencia directa a cuenta bancaria",
    "isActive": true,
    "displayOrder": 2,
    "maxInstallments": 1,
    "installmentInterest": 0,
    "discount": 5,
    "surcharge": 0,
    "icon": "bank-icon.svg"
  }
]
```

---

### Obtener Método de Pago por ID

**Endpoint**: `GET /payment-methods/:id`

**Parámetros de URL**:
- `id` (string, requerido): ID del método de pago

**Respuesta**: `200 OK` (mismo formato que listar)

**Errores**:
- `404`: Método de pago no encontrado

---

### Crear Método de Pago

**Endpoint**: `POST /payment-methods`

**Body**:

```json
{
  "name": "Tarjeta de Crédito",
  "type": "credit_card",
  "description": "Pago con tarjetas Visa, Mastercard, AMEX",
  "isActive": true,
  "displayOrder": 1,
  "maxInstallments": 12,
  "installmentInterest": 2.5,
  "discount": 0,
  "surcharge": 0,
  "icon": "credit-card-icon.svg"
}
```

**Campos Requeridos**:
- `name` (string)
- `type` (string): credit_card | debit_card | bank_transfer | cash | digital_wallet

**Respuesta**: `201 Created`

---

### Actualizar Método de Pago

**Endpoint**: `PATCH /payment-methods/:id`

**Parámetros de URL**:
- `id` (string, requerido): ID del método de pago

**Body**: (Campos a actualizar)

```json
{
  "maxInstallments": 18,
  "installmentInterest": 3.0
}
```

**Respuesta**: `200 OK`

---

### Eliminar Método de Pago

**Endpoint**: `DELETE /payment-methods/:id`

**Parámetros de URL**:
- `id` (string, requerido): ID del método de pago

**Respuesta**: `204 No Content`

---

### Activar/Desactivar Método de Pago

**Endpoint**: `PATCH /payment-methods/:id/toggle-active`

**Parámetros de URL**:
- `id` (string, requerido): ID del método de pago

**Respuesta**: `200 OK`

```json
{
  "id": "pm_123456",
  "name": "Tarjeta de Crédito",
  "isActive": false
}
```

---

### Reordenar Métodos de Pago

**Endpoint**: `POST /payment-methods/reorder`

**Body**:

```json
{
  "order": ["pm_456", "pm_123", "pm_789"]
}
```

**Respuesta**: `204 No Content`

---

## Grupos de Personalización (Customization Groups)

### Listar Grupos

**Endpoint**: `GET /customization-groups`

**Respuesta**: `200 OK`

```json
[
  {
    "id": "group_123456",
    "name": "Personalización de logos",
    "description": "Opciones para personalizar el logo del producto",
    "isActive": true,
    "displayOrder": 1,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### Listar Grupos Activos

**Endpoint**: `GET /customization-groups/active`

Retorna solo los grupos marcados como activos.

**Respuesta**: `200 OK` (mismo formato)

---

### Obtener Grupo por ID

**Endpoint**: `GET /customization-groups/:id`

**Respuesta**: `200 OK`

---

### Crear Grupo

**Endpoint**: `POST /customization-groups`

**Body**:

```json
{
  "name": "Personalización de logos",
  "description": "Opciones para personalizar el logo del producto",
  "isActive": true,
  "displayOrder": 1
}
```

**Respuesta**: `201 Created`

---

### Actualizar Grupo

**Endpoint**: `PATCH /customization-groups/:id`

**Respuesta**: `200 OK`

---

### Eliminar Grupo

**Endpoint**: `DELETE /customization-groups/:id`

**Respuesta**: `204 No Content`

---

### Activar/Desactivar Grupo

**Endpoint**: `PATCH /customization-groups/:id/toggle-active`

**Respuesta**: `200 OK`

---

### Reordenar Grupos

**Endpoint**: `POST /customization-groups/reorder`

**Body**:

```json
{
  "order": ["group_456", "group_123", "group_789"]
}
```

**Respuesta**: `204 No Content`

---

## Campos de Personalización (Customization Fields)

### Listar Campos

**Endpoint**: `GET /customization-fields`

**Query Parameters**:
- `groupId` (string, opcional): Filtrar campos por grupo

**Ejemplo**: `GET /customization-fields?groupId=group_123456`

**Respuesta**: `200 OK`

```json
[
  {
    "id": "field_123456",
    "groupId": "group_789",
    "name": "Color del logo",
    "label": "Selecciona el color",
    "type": "select",
    "required": true,
    "isActive": true,
    "displayOrder": 1,
    "options": ["Rojo", "Azul", "Verde"],
    "placeholder": "Seleccione un color",
    "helpText": "El color se aplicará al logo principal",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### Obtener Campo por ID

**Endpoint**: `GET /customization-fields/:id`

**Respuesta**: `200 OK`

---

### Crear Campo

**Endpoint**: `POST /customization-fields`

**Body**:

```json
{
  "groupId": "group_789",
  "name": "Color del logo",
  "label": "Selecciona el color",
  "type": "select",
  "required": true,
  "isActive": true,
  "displayOrder": 1,
  "options": ["Rojo", "Azul", "Verde"],
  "placeholder": "Seleccione un color",
  "helpText": "El color se aplicará al logo principal"
}
```

**Tipos de Campo**:
- `text`: Texto simple
- `textarea`: Texto largo
- `number`: Números
- `select`: Lista desplegable
- `checkbox`: Casilla de verificación
- `radio`: Opciones de radio

**Respuesta**: `201 Created`

---

### Actualizar Campo

**Endpoint**: `PATCH /customization-fields/:id`

**Respuesta**: `200 OK`

---

### Eliminar Campo

**Endpoint**: `DELETE /customization-fields/:id`

**Respuesta**: `204 No Content`

---

### Activar/Desactivar Campo

**Endpoint**: `PATCH /customization-fields/:id/toggle-active`

**Respuesta**: `200 OK`

---

### Reordenar Campos

**Endpoint**: `POST /customization-fields/reorder`

**Body**:

```json
{
  "order": ["field_456", "field_123", "field_789"]
}
```

**Respuesta**: `204 No Content`

---

## Inventario (Inventory)

### Obtener Inventario

**Endpoint**: `GET /inventory`

**Query Parameters**:
- `product_id` (string, opcional): Filtrar por producto
- `location_id` (string, opcional): Filtrar por ubicación
- `sku` (string, opcional): Filtrar por SKU
- `minStock` (number, opcional): Stock mínimo
- `inStock` (boolean, opcional): Solo productos con stock

**Ejemplo**: `GET /inventory?product_id=prod_123456&inStock=true`

**Respuesta**: `200 OK`

```json
[
  {
    "id": "inv_123456",
    "productId": "prod_123456",
    "productName": "Laptop Dell XPS 13",
    "sku": "DELL-XPS13-2024",
    "locationId": "loc_789",
    "locationName": "Bodega Central",
    "quantity": 15,
    "reserved": 3,
    "available": 12,
    "minStock": 5,
    "maxStock": 50,
    "status": "in_stock",
    "lastUpdated": "2024-01-15T14:45:00.000Z"
  }
]
```

**Estados de Inventario**:
- `in_stock`: En stock
- `low_stock`: Stock bajo
- `out_of_stock`: Sin stock

---

### Obtener Inventario Agregado

Suma el inventario de todas las ubicaciones por producto.

**Endpoint**: `GET /inventory/aggregated`

**Query Parameters**:
- `product_id` (string, opcional): Filtrar por producto
- `category` (string, opcional): Filtrar por categoría
- `lowStock` (boolean, opcional): Solo productos con stock bajo

**Respuesta**: `200 OK`

```json
[
  {
    "productId": "prod_123456",
    "productName": "Laptop Dell XPS 13",
    "sku": "DELL-XPS13-2024",
    "totalQuantity": 45,
    "totalReserved": 8,
    "totalAvailable": 37,
    "locations": 3,
    "status": "in_stock",
    "byLocation": [
      {
        "locationId": "loc_789",
        "locationName": "Bodega Central",
        "quantity": 15,
        "available": 12
      },
      {
        "locationId": "loc_456",
        "locationName": "Bodega Norte",
        "quantity": 20,
        "available": 18
      },
      {
        "locationId": "loc_123",
        "locationName": "Bodega Sur",
        "quantity": 10,
        "available": 7
      }
    ]
  }
]
```

---

### Actualizar Inventario

**Endpoint**: `PUT /inventory`

**Body**:

```json
{
  "updates": [
    {
      "productId": "prod_123456",
      "locationId": "loc_789",
      "adjustment": 10,
      "reason": "Recepción de mercancía"
    },
    {
      "productId": "prod_789",
      "locationId": "loc_789",
      "quantity": 25,
      "reason": "Conteo físico"
    }
  ],
  "bulkUpdate": true
}
```

**Campos por Actualización**:
- `productId` (string, requerido): ID del producto
- `locationId` (string, requerido): ID de la ubicación
- `quantity` (number, opcional): Nueva cantidad total
- `adjustment` (number, opcional): Ajuste incremental (+/-)
- `reason` (string, opcional): Motivo del ajuste

**Nota**: Usar `quantity` para establecer cantidad absoluta o `adjustment` para incremento/decremento.

**Respuesta**: `200 OK`

```json
{
  "success": true,
  "updated": 2,
  "results": [
    {
      "productId": "prod_123456",
      "locationId": "loc_789",
      "previousQuantity": 15,
      "newQuantity": 25,
      "status": "success"
    },
    {
      "productId": "prod_789",
      "locationId": "loc_789",
      "previousQuantity": 20,
      "newQuantity": 25,
      "status": "success"
    }
  ]
}
```

---

## WebSockets

La API proporciona actualizaciones en tiempo real del carrito usando Socket.IO.

### Conectar al Servidor

```typescript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  transports: ['websocket'],
  autoConnect: true
});

socket.on('connect', () => {
  console.log('Conectado al servidor WebSocket');
});
```

### Eventos Cliente → Servidor

#### Suscribirse a Carrito

```typescript
socket.emit('cart:subscribe', {
  cartId: 'cart_123456'
});
```

#### Obtener Estado del Carrito

```typescript
socket.emit('cart:get', {
  cartId: 'cart_123456'
}, (response) => {
  console.log('Carrito:', response);
});
```

#### Actualizar Carrito

```typescript
socket.emit('cart:update', {
  cartId: 'cart_123456',
  items: [
    {
      productId: 'prod_123456',
      quantity: 2
    }
  ]
});
```

### Eventos Servidor → Cliente

#### Carrito Actualizado

```typescript
socket.on('cart:updated', (data) => {
  console.log('Carrito actualizado:', data);
  // data contiene el carrito completo actualizado
});
```

#### Item Agregado

```typescript
socket.on('cart:item-added', (data) => {
  console.log('Item agregado:', data.item);
});
```

#### Item Removido

```typescript
socket.on('cart:item-removed', (data) => {
  console.log('Item removido:', data.itemId);
});
```

#### Error

```typescript
socket.on('cart:error', (error) => {
  console.error('Error en carrito:', error.message);
});
```

### Desconectar

```typescript
socket.disconnect();
```

---

## Ejemplos de Integración

### Ejemplo 1: Crear Cotización Completa

```typescript
// 1. Crear un carrito
const createCartResponse = await fetch('http://localhost:3000/cart', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    conversationId: 'conv_' + Date.now(),
    items: [
      {
        productId: 'prod_123456',
        name: 'Laptop Dell XPS 13',
        sku: 'DELL-XPS13-2024',
        price: 1299990,
        quantity: 1,
        size: '13 pulgadas',
        color: 'Plata'
      }
    ]
  })
});

const cart = await createCartResponse.json();
console.log('Carrito creado:', cart.id);

// 2. Agregar personalizaciones
const updateResponse = await fetch(`http://localhost:3000/cart/${cart.id}/customization`, {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    itemUpdates: [
      {
        itemId: cart.items[0].id,
        customizationValues: {
          'logo': 'Logo Empresa ABC',
          'color': 'Azul Corporativo'
        }
      }
    ]
  })
});

console.log('Personalizaciones agregadas');
```

### Ejemplo 2: Buscar Productos y Verificar Stock

```typescript
// 1. Buscar productos
const searchResponse = await fetch(
  'http://localhost:3000/products?search=laptop&category=Laptops&minPrice=1000000&maxPrice=2000000'
);
const productsData = await searchResponse.json();

// 2. Verificar stock del primer producto
const product = productsData.data[0];
const inventoryResponse = await fetch(
  `http://localhost:3000/inventory?product_id=${product.id}`
);
const inventory = await inventoryResponse.json();

console.log(`Producto: ${product.name}`);
console.log(`Stock disponible: ${inventory[0].available} unidades`);
```

### Ejemplo 3: Configurar Métodos de Pago

```typescript
// 1. Obtener métodos de pago activos
const methodsResponse = await fetch('http://localhost:3000/payment-methods');
const paymentMethods = await methodsResponse.json();

// 2. Crear nuevo método de pago
const newMethodResponse = await fetch('http://localhost:3000/payment-methods', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'PayPal',
    type: 'digital_wallet',
    description: 'Pago con PayPal',
    isActive: true,
    displayOrder: 5,
    maxInstallments: 1,
    discount: 2.5
  })
});

const newMethod = await newMethodResponse.json();
console.log('Método de pago creado:', newMethod.id);
```

### Ejemplo 4: Integración con WebSocket en React

```typescript
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

function CartComponent({ cartId }) {
  const [cart, setCart] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Conectar al WebSocket
    const newSocket = io('http://localhost:3000');
    setSocket(newSocket);

    // Suscribirse a actualizaciones del carrito
    newSocket.emit('cart:subscribe', { cartId });

    // Escuchar actualizaciones
    newSocket.on('cart:updated', (updatedCart) => {
      setCart(updatedCart);
    });

    // Obtener estado inicial
    newSocket.emit('cart:get', { cartId }, (response) => {
      setCart(response);
    });

    // Cleanup
    return () => {
      newSocket.disconnect();
    };
  }, [cartId]);

  const updateQuantity = (itemId, quantity) => {
    socket.emit('cart:update', {
      cartId,
      items: cart.items.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    });
  };

  return (
    <div>
      <h2>Carrito</h2>
      {cart && (
        <>
          <p>Total: ${cart.totalPrice}</p>
          {cart.items.map(item => (
            <div key={item.id}>
              <p>{item.name}</p>
              <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                +
              </button>
              <span>{item.quantity}</span>
              <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                -
              </button>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
```

---

## Mejores Prácticas

1. **Manejo de Errores**: Siempre verifica el código de estado HTTP y maneja los errores apropiadamente.

2. **Paginación**: Usa los parámetros de paginación en endpoints que retornan listas grandes.

3. **Caché**: Implementa caché en el cliente para reducir llamadas innecesarias.

4. **WebSockets**: Usa WebSockets para actualizaciones en tiempo real en lugar de polling.

5. **Validación**: Valida datos en el cliente antes de enviarlos a la API.

6. **IDs**: Nunca asumas el formato de los IDs, siempre úsalos como strings opacos.

7. **Fechas**: Todas las fechas están en formato ISO 8601 UTC.

8. **Precios**: Los precios son números enteros representando la moneda local.

---

## Soporte

Para más información o soporte:

- **Documentación Interactiva**: http://localhost:3000/docs
- **Issues**: GitHub Issues
- **Email**: support@example.com

---

**Última actualización**: Enero 2025  
**Versión de la API**: 1.0.0

