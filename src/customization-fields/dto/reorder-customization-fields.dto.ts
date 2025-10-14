import { IsArray, ValidateNested, IsUUID, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class FieldOrderDto {
  @IsUUID()
  id: string;

  @IsNumber()
  sortOrder: number;
}

export class ReorderCustomizationFieldsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FieldOrderDto)
  fieldOrders: FieldOrderDto[];
}
