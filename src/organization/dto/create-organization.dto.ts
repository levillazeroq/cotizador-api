import { IsString, IsNotEmpty, IsOptional, IsEnum, IsObject, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrganizationDto {
  @ApiProperty({
    description: 'Organization name',
    example: 'Acme Corporation',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'Unique organization code',
    example: 'ACME001',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  code: string;

  @ApiPropertyOptional({
    description: 'Organization description',
    example: 'Leading provider of innovative solutions',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Organization status',
    enum: ['active', 'inactive', 'suspended'],
    default: 'active',
  })
  @IsEnum(['active', 'inactive', 'suspended'])
  @IsOptional()
  status?: 'active' | 'inactive' | 'suspended';

  @ApiPropertyOptional({
    description: 'Organization settings (JSON object)',
    example: { theme: 'dark', language: 'en' },
  })
  @IsObject()
  @IsOptional()
  settings?: Record<string, any>;
}
