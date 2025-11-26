import { IsString, IsNumber, Min, IsBoolean, isString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateCartItemDto {
  @ApiProperty({
    description: 'ID único del producto',
    example: 'prod_123456',
    type: String,
  })
  @IsString()
  productId: number

  @ApiProperty({
    description: 'Cantidad del producto a agregar al carrito',
    example: 1,
    type: Number,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  quantity: number

  @ApiProperty({})
  @IsString()
  operation: 'add' | 'remove' = 'add'
}
