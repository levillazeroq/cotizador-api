import { IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class WebpayCallbackDto {
  @ApiProperty({ description: 'Transaction token from Webpay' })
  @IsString()
  token: string;

  @ApiPropertyOptional({ description: 'Transaction ID from Webpay' })
  @IsOptional()
  @IsString()
  transactionId?: string;

  @ApiPropertyOptional({ description: 'Transaction status' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Transaction amount' })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiPropertyOptional({ description: 'Authorization code' })
  @IsOptional()
  @IsString()
  authorizationCode?: string;
}

