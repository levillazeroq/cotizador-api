import { IsArray, ValidateNested, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateCartItemDto } from './create-cart-item.dto';

export class UpdateCartSuggestionsDto {
  @ApiPropertyOptional({
    description:
      'Lista de items del carrito. Si se proporciona, reemplaza todos los items existentes. Solo se requiere productId y quantity, el resto de la información se obtendrá automáticamente del producto.',
    type: [CreateCartItemDto],
    example: [
      {
        productId: 'prod_123456',
        quantity: 1,
      },
      {
        productId: 'prod_789012',
        quantity: 2,
      },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCartItemDto)
  suggestions?: CreateCartItemDto[];
}
