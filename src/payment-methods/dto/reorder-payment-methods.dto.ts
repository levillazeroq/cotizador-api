import { IsArray, ValidateNested, IsString, IsNumber } from 'class-validator'
import { Type } from 'class-transformer'

export class PaymentMethodOrderDto {
  @IsString()
  id: string

  @IsNumber()
  sortOrder: number
}

export class ReorderPaymentMethodsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentMethodOrderDto)
  fieldOrders: PaymentMethodOrderDto[]
}
