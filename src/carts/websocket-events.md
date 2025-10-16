# WebSocket Events - Cart System

## Connection

### Namespace
- **Path**: `/carts`
- **CORS**: Configurado para permitir conexiones desde localhost y dominios de producción

## Client Events (Client → Server)

### `join_cart`
Únete a una sala específica de carrito para recibir actualizaciones en tiempo real.

```javascript
socket.emit('join_cart', { cartId: 'cart_123456' })
```

**Payload:**
```typescript
{
  cartId: string
}
```

**Response:** `joined_cart`

### `leave_cart`
Abandona una sala específica de carrito.

```javascript
socket.emit('leave_cart', { cartId: 'cart_123456' })
```

**Payload:**
```typescript
{
  cartId: string
}
```

**Response:** `left_cart`

### `ping`
Verifica la conexión con el servidor.

```javascript
socket.emit('ping')
```

**Response:** `pong`

## Server Events (Server → Client)

### `connected`
Emitido cuando un cliente se conecta exitosamente.

```typescript
{
  message: string
  clientId: string
  timestamp: string
}
```

### `joined_cart`
Confirmación de que el cliente se unió a una sala de carrito.

```typescript
{
  cartId: string
  message: string
  timestamp: string
}
```

### `left_cart`
Confirmación de que el cliente abandonó una sala de carrito.

```typescript
{
  cartId: string
  message: string
  timestamp: string
}
```

### `pong`
Respuesta al ping del cliente.

```typescript
{
  message: string
  timestamp: string
}
```

### `cart_created`
Emitido cuando se crea un nuevo carrito.

```typescript
{
  cartId: string
  cart: {
    id: string
    items: CartItem[]
    totalItems: number
    totalPrice: number
    createdAt: string
    updatedAt: string
  }
  timestamp: string
}
```

### `cart_updated`
Emitido cuando se actualiza un carrito específico. Solo se envía a los clientes que están en la sala del carrito.

```typescript
{
  cartId: string
  cart: {
    id: string
    items: CartItem[]
    totalItems: number
    totalPrice: number
    createdAt: string
    updatedAt: string
  }
  timestamp: string
}
```

### `cart_deleted`
Emitido cuando se elimina un carrito.

```typescript
{
  cartId: string
  timestamp: string
}
```

### `carts_list_updated`
Emitido cuando la lista de carritos se actualiza (después de cualquier operación).

```typescript
{
  carts: Cart[]
  timestamp: string
}
```

## Ejemplo de Uso

### Cliente JavaScript/TypeScript

```javascript
import { io } from 'socket.io-client'

// Conectar al namespace de carritos
const socket = io('http://localhost:3000/carts')

// Escuchar eventos de conexión
socket.on('connected', (data) => {
  console.log('Conectado:', data)
})

// Unirse a un carrito específico
socket.emit('join_cart', { cartId: 'cart_123456' })

// Escuchar actualizaciones del carrito
socket.on('cart_updated', (data) => {
  console.log('Carrito actualizado:', data.cart)
  // Actualizar la UI con los nuevos datos
})

// Escuchar actualizaciones de la lista de carritos
socket.on('carts_list_updated', (data) => {
  console.log('Lista de carritos actualizada:', data.carts)
  // Actualizar la lista de carritos en la UI
})

// Escuchar cuando se crea un nuevo carrito
socket.on('cart_created', (data) => {
  console.log('Nuevo carrito creado:', data.cart)
  // Agregar el nuevo carrito a la lista
})

// Abandonar un carrito
socket.emit('leave_cart', { cartId: 'cart_123456' })

// Desconectar
socket.disconnect()
```

### React Hook Example

```typescript
import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'

interface Cart {
  id: string
  items: any[]
  totalItems: number
  totalPrice: number
  createdAt: string
  updatedAt: string
}

export function useCartWebSocket(cartId?: string) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [cart, setCart] = useState<Cart | null>(null)
  const [carts, setCarts] = useState<Cart[]>([])
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const newSocket = io('http://localhost:3000/carts')
    
    newSocket.on('connected', () => {
      setConnected(true)
      console.log('Conectado al WebSocket de carritos')
    })

    newSocket.on('cart_updated', (data) => {
      if (data.cartId === cartId) {
        setCart(data.cart)
      }
    })

    newSocket.on('carts_list_updated', (data) => {
      setCarts(data.carts)
    })

    newSocket.on('cart_created', (data) => {
      setCarts(prev => [...prev, data.cart])
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [])

  useEffect(() => {
    if (socket && cartId) {
      socket.emit('join_cart', { cartId })
      
      return () => {
        socket.emit('leave_cart', { cartId })
      }
    }
  }, [socket, cartId])

  return {
    socket,
    cart,
    carts,
    connected,
    joinCart: (id: string) => socket?.emit('join_cart', { cartId: id }),
    leaveCart: (id: string) => socket?.emit('leave_cart', { cartId: id }),
  }
}
```

## Operaciones que Disparan Eventos

1. **Crear carrito** (`POST /cart`) → `cart_created` + `carts_list_updated`
2. **Agregar item** (`POST /cart/items`) → `cart_updated` + `carts_list_updated`
3. **Actualizar cantidad** (`PUT /cart/items/:productId/quantity`) → `cart_updated` + `carts_list_updated`
4. **Eliminar item** (`DELETE /cart/items/:productId`) → `cart_updated` + `carts_list_updated`
5. **Actualizar carrito** (`PUT /cart/:id`) → `cart_updated` + `carts_list_updated`
6. **Limpiar carrito** (`POST /cart/clear`) → `cart_updated` + `carts_list_updated`

## Consideraciones de Rendimiento

- Los eventos `cart_updated` solo se envían a los clientes que están en la sala específica del carrito
- Los eventos `carts_list_updated` se envían a todos los clientes conectados
- Se recomienda implementar debouncing en el cliente para evitar actualizaciones excesivas de la UI
- Los eventos incluyen timestamps para facilitar la sincronización y debugging
