import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateOrganizationDto } from './create-organization.dto';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateOrganizationDto extends PartialType(CreateOrganizationDto) {}

export class UpdateOrganizationStatusDto {
  @ApiPropertyOptional({
    description: 'Organization status',
    enum: ['active', 'inactive', 'suspended'],
  })
  @IsEnum(['active', 'inactive', 'suspended'])
  status: 'active' | 'inactive' | 'suspended';
}
