import { IsNumber, Min } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class UpdateCartItemQuantityDto {
  @ApiProperty({
    description: 'Nueva cantidad del item en el carrito. Si es 0, el item se elimina del carrito',
    example: 3,
    type: Number,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  quantity: number
}
