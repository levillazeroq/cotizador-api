import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class ChangelogItemResponseDto {
  @ApiProperty({ example: 'changelog_123', description: 'ID único del registro' })
  id: string

  @ApiProperty({ example: 'cart_123456', description: 'ID del carrito' })
  cartId: string

  @ApiProperty({ example: 'prod_123456', description: 'ID del producto' })
  productId: string

  @ApiProperty({ example: 'Laptop Dell XPS 13', description: 'Nombre del producto' })
  productName: string

  @ApiPropertyOptional({ example: 'DELL-XPS13-2024', description: 'SKU del producto' })
  sku?: string

  @ApiProperty({ enum: ['add', 'remove'], example: 'add', description: 'Operación realizada' })
  operation: 'add' | 'remove'

  @ApiProperty({ example: 2, description: 'Cantidad afectada' })
  quantity: number

  @ApiPropertyOptional({ example: '1299990', description: 'Precio del producto' })
  price?: string

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Fecha de creación' })
  createdAt: Date
}

