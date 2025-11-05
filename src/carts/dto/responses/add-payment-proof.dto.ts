import { IsUUID, IsNumber, IsString, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddPaymentProofDto {
  @ApiProperty({
    description: 'ID del método de pago (cheque o transferencia)',
    example: 'pm_123456',
    type: String,
  })
  @IsUUID()
  paymentMethodId: string;

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

