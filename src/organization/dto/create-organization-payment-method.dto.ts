import { IsBoolean, IsOptional, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrganizationPaymentMethodDto {
  @ApiProperty({
    description: 'Organization ID',
    example: 1,
  })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  organizationId: number;

  @ApiPropertyOptional({
    description: 'Check payment method active status',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isCheckActive?: boolean;

  @ApiPropertyOptional({
    description: 'WebPay payment method active status',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isWebPayActive?: boolean;

  @ApiPropertyOptional({
    description: 'Bank transfer payment method active status',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isBankTransferActive?: boolean;
}

