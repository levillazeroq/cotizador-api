import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ValidateProofDto {
  @ApiProperty({ description: 'Whether the proof is valid' })
  @IsBoolean()
  isValid: boolean;

  @ApiPropertyOptional({ description: 'Validation notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Transaction ID found in proof' })
  @IsOptional()
  @IsString()
  transactionId?: string;
}

