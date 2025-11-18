import { IsNumber, IsString, IsOptional, Min, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddPaymentProofDto {
  @ApiProperty({
    description: 'Tipo de pago',
    enum: ['bank_transfer', 'check'],
    example: 'bank_transfer',
    type: String,
  })
  @IsEnum(['bank_transfer', 'check'])
  paymentType: 'bank_transfer' | 'check';

  @ApiProperty({
    description: 'Monto del pago',
    example: 100000,
    type: Number,
  })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiPropertyOptional({
    description: 'Referencia externa (número de cheque, referencia de transferencia, etc.)',
    example: '123456',
    type: String,
  })
  @IsOptional()
  @IsString()
  externalReference?: string;

  @ApiPropertyOptional({
    description: 'Notas adicionales sobre el pago',
    example: 'Cheque número 123456',
    type: String,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

