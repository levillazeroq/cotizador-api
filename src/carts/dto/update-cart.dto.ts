import { IsArray, ValidateNested, IsOptional } from 'class-validator'
import { Type } from 'class-transformer'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { CreateCartItemDto } from './create-cart-item.dto'

export class UpdateCartDto {
  @ApiPropertyOptional({
    description: 'Lista de items del carrito. Si se proporciona, reemplaza todos los items existentes',
    type: [CreateCartItemDto],
    example: [
      {
        productId: 'prod_123456',
        name: 'Laptop Dell XPS 13',
        sku: 'DELL-XPS13-2024',
        size: '13 pulgadas',
        color: 'Plata',
        price: 1299990,
        quantity: 1,
        imageUrl: 'https://example.com/images/laptop.jpg',
        maxStock: 10,
      },
      {
        productId: 'prod_789012',
        name: 'Mouse Inalámbrico',
        sku: 'MOUSE-WIRELESS-001',
        price: 25000,
        quantity: 2,
        maxStock: 50,
      },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCartItemDto)
  items?: CreateCartItemDto[]
}
