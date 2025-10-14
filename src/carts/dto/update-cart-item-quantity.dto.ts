import { IsNumber, Min } from 'class-validator'

export class UpdateCartItemQuantityDto {
  @IsNumber()
  @Min(0)
  quantity: number
}
