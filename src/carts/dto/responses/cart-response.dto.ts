import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { CartItemResponseDto } from './cart-item-response.dto'

export class CartResponseDto {
  @ApiProperty({ example: 'cart_123456', description: 'ID único del carrito' })
  id: string

  @ApiPropertyOptional({ example: 'conv_abc123xyz', description: 'ID de la conversación' })
  conversationId?: string

  @ApiProperty({ type: [CartItemResponseDto], description: 'Items del carrito' })
  items: CartItemResponseDto[]

  @ApiProperty({ example: 3, description: 'Total de items en el carrito' })
  totalItems: number

  @ApiProperty({ example: 1349990, description: 'Precio total del carrito' })
  totalPrice: number

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Fecha de creación' })
  createdAt: Date

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Fecha de actualización' })
  updatedAt: Date
}

