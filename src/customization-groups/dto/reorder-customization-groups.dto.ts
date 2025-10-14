import { IsArray, ValidateNested, IsString, IsNumber } from 'class-validator'
import { Type } from 'class-transformer'

export class CustomizationGroupOrderDto {
  @IsString()
  id: string

  @IsNumber()
  sortOrder: number
}

export class ReorderCustomizationGroupsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CustomizationGroupOrderDto)
  groupOrders: CustomizationGroupOrderDto[]
}
