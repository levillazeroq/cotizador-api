import { IsString, IsOptional, IsBoolean, IsNumber, IsEnum, IsUUID, IsObject } from 'class-validator';

export class CreateCustomizationFieldDto {
  @IsUUID()
  groupId: string;

  @IsString()
  name: string;

  @IsString()
  displayName: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(['text', 'number', 'select', 'checkbox', 'textarea'])
  type: 'text' | 'number' | 'select' | 'checkbox' | 'textarea';

  @IsOptional()
  @IsObject()
  options?: any; // JSON object for select options

  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @IsOptional()
  @IsNumber()
  minValue?: number;

  @IsOptional()
  @IsNumber()
  maxValue?: number;

  @IsOptional()
  @IsNumber()
  maxLength?: number;

  @IsOptional()
  @IsObject()
  imageConstraints?: any;
}
