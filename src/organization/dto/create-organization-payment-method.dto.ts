import { IsBoolean, IsOptional, IsNotEmpty, IsNumber, IsPositive, IsString, MaxLength, Matches } from 'class-validator';
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

  @ApiPropertyOptional({
    description: 'Prefix for WebPay buy order (max 9 alphanumeric characters). Format: prefix-cartId',
    example: 'workit',
    default: 'workit',
    maxLength: 9,
  })
  @IsString()
  @IsOptional()
  @MaxLength(9, { message: 'WebPay prefix must be 9 characters or less' })
  @Matches(/^[a-zA-Z0-9]*$/, { message: 'WebPay prefix must contain only letters and numbers' })
  webPayPrefix?: string;

  @ApiPropertyOptional({
    description: 'Child commerce code for WebPay (max 50 characters). Used for multi-commerce configurations in Transbank',
    example: '597055555532',
    maxLength: 50,
  })
  @IsString()
  @IsOptional()
  @MaxLength(50, { message: 'WebPay child commerce code must be 50 characters or less' })
  webPayChildCommerceCode?: string;
}

