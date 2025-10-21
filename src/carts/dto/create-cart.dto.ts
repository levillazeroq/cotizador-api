import { IsString, IsArray, IsOptional, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { CreateCartItemDto } from './create-cart-item.dto'

export class CreateCartDto {
  @ApiProperty({
    description: 'ID de la conversación asociada al carrito',
    example: 'conv_abc123xyz',
    type: String,
  })
  @IsString()
  conversationId: string

  @ApiPropertyOptional({
    description: 'Items iniciales para agregar al carrito. Solo se requiere productId y quantity, el resto de la información se obtendrá automáticamente del producto.',
    type: [CreateCartItemDto],
    example: [
      {
        productId: 'prod_123456',
        quantity: 1,
      },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCartItemDto)
  items?: CreateCartItemDto[]
}

