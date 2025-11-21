import { IsString, IsOptional, IsBoolean, IsInt, MinLength, MaxLength } from 'class-validator';

export class CreateCustomizationFieldGroupDto {
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

