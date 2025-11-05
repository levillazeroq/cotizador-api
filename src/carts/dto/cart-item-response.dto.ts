import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CartItemResponseDto {
  @ApiProperty({ example: 'item_789', description: 'ID único del item' })
  id: string

  @ApiProperty({ example: 'cart_123456', description: 'ID del carrito' })
  cartId: string

  @ApiProperty({ example: 'prod_123456', description: 'ID del producto' })
  productId: string

  @ApiProperty({ example: 'Laptop Dell XPS 13', description: 'Nombre del producto' })
  name: string

  @ApiPropertyOptional({ example: 'DELL-XPS13-2024', description: 'SKU del producto' })
  sku?: string

  @ApiPropertyOptional({ example: '13 pulgadas', description: 'Talla del producto' })
  size?: string

  @ApiPropertyOptional({ example: 'Plata', description: 'Color del producto' })
  color?: string

  @ApiProperty({ example: 1299990, description: 'Precio unitario del producto' })
  price: number

  @ApiProperty({ example: 1, description: 'Cantidad del producto' })
  quantity: number

  @ApiPropertyOptional({ example: 'https://example.com/images/laptop.jpg', description: 'URL de la imagen' })
  imageUrl?: string

  @ApiPropertyOptional({ example: 10, description: 'Stock máximo disponible' })
  maxStock?: number

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Fecha de creación' })
  createdAt: Date

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Fecha de actualización' })
  updatedAt: Date

  @ApiPropertyOptional({ example: { 'field-1': 'Logo personalizado' }, description: 'Valores de personalización' })
  customizationValues?: Record<string, any>
}

