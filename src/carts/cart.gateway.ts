import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { Logger } from '@nestjs/common'

@WebSocketGateway({
  cors: {
    origin: true, // Permite cualquier origen
    credentials: false,
  },
  namespace: '/carts',
})
export class CartGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  private readonly logger = new Logger(CartGateway.name)
  private connectedClients = new Map<string, Socket>()

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`)
    this.connectedClients.set(client.id, client)
    
    // Send welcome message
    client.emit('connected', {
      message: 'Connected to Cart WebSocket',
      clientId: client.id,
      timestamp: new Date().toISOString(),
    })
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`)
    this.connectedClients.delete(client.id)
  }

  @SubscribeMessage('join_cart')
  handleJoinCart(
    @MessageBody() data: { cartId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { cartId } = data
    this.logger.log(`Client ${client.id} joining cart: ${cartId}`)
    
    // Join the specific cart room
    client.join(`cart_${cartId}`)
    
    // Confirm join
    client.emit('joined_cart', {
      cartId,
      message: `Joined cart ${cartId}`,
      timestamp: new Date().toISOString(),
    })
  }

  @SubscribeMessage('leave_cart')
  handleLeaveCart(
    @MessageBody() data: { cartId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { cartId } = data
    this.logger.log(`Client ${client.id} leaving cart: ${cartId}`)
    
    // Leave the specific cart room
    client.leave(`cart_${cartId}`)
    
    // Confirm leave
    client.emit('left_cart', {
      cartId,
      message: `Left cart ${cartId}`,
      timestamp: new Date().toISOString(),
    })
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    client.emit('pong', {
      message: 'pong',
      timestamp: new Date().toISOString(),
    })
  }

  emitCartUpdated(cartId: string, cartData: any) {
    this.logger.log(`Emitting cart_updated for cart: ${cartId}`)
    this.server.to(`cart_${cartId}`).emit('cart_updated', {
      cartId,
      cart: cartData,
      timestamp: new Date().toISOString(),
    })
  }

  // Get connected clients count
  getConnectedClientsCount(): number {
    return this.connectedClients.size
  }

  // Get clients in specific cart room
  getClientsInCart(cartId: string): number {
    const room = this.server.sockets.adapter.rooms.get(`cart_${cartId}`)
    return room ? room.size : 0
  }
}
