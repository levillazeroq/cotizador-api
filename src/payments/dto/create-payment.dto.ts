import {
  IsUUID,
  IsNumber,
  IsOptional,
  IsString,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentStatus } from '../../database/schemas';

export class CreatePaymentDto {
  @ApiProperty({ description: 'Cart ID' })
  @IsUUID()
  cartId: string;

  @ApiProperty({ description: 'Payment Method ID' })
  @IsUUID()
  paymentMethodId: string;

  @ApiProperty({ description: 'Payment amount' })
  @IsNumber()
  amount: number;

  @ApiPropertyOptional({
    description: 'Payment status',
    enum: [
      'pending',
      'processing',
      'completed',
      'failed',
      'cancelled',
      'refunded',
    ],
  })
  @IsOptional()
  @IsEnum([
    'pending',
    'processing',
    'completed',
    'failed',
    'cancelled',
    'refunded',
  ])
  status?: PaymentStatus;

  @ApiPropertyOptional({ description: 'Proof of payment URL' })
  @IsOptional()
  @IsString()
  proofUrl?: string;

  @ApiPropertyOptional({ description: 'Transaction ID' })
  @IsOptional()
  @IsString()
  transactionId?: string;

  @ApiPropertyOptional({ description: 'External reference' })
  @IsOptional()
  @IsString()
  externalReference?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Payment notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}
