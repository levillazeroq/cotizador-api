import { IsUUID, IsNumber, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProofPaymentDto {
  @ApiProperty({ description: 'Cart ID' })
  @IsUUID()
  cartId: string;

  @ApiProperty({ description: 'Payment Method ID (check or transfer)' })
  @IsUUID()
  paymentMethodId: string;

  @ApiProperty({ description: 'Payment amount' })
  @IsNumber()
  amount: number;

  @ApiProperty({ description: 'Proof URL (screenshot/document)' })
  @IsString()
  proofUrl: string;

  @ApiPropertyOptional({ description: 'Payment notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Transaction reference from bank' })
  @IsOptional()
  @IsString()
  externalReference?: string;
}

