import { IsString, IsBoolean, IsOptional, IsNumber, MinLength, MaxLength } from 'class-validator'

export class CreateCustomizationGroupDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string

  @IsString()
  @MinLength(1)
  @MaxLength(500)
  displayName: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  @IsOptional()
  @IsNumber()
  sortOrder?: number
}
