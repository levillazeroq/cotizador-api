import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PriceListConditionResponseDto {
  @ApiProperty({
    description: 'ID único de la condición',
    example: 1,
    type: Number,
  })
  id: number;

  @ApiProperty({
    description: 'ID de la organización',
    example: 2,
    type: Number,
  })
  organizationId: number;

  @ApiProperty({
    description: 'ID de la lista de precios',
    example: 1,
    type: Number,
  })
  priceListId: number;

  @ApiProperty({
    description: 'Estado de la condición',
    example: 'active',
    enum: ['active', 'inactive'],
  })
  status: string;

  @ApiProperty({
    description: 'Tipo de condición',
    example: 'amount',
    enum: ['amount', 'quantity', 'date_range', 'customer_type'],
  })
  conditionType: string;

  @ApiProperty({
    description: 'Operador de comparación',
    example: 'greater_or_equal',
    enum: [
      'equals',
      'greater_than',
      'greater_or_equal',
      'less_than',
      'less_or_equal',
      'between',
      'after',
      'before',
    ],
  })
  operator: string;

  @ApiProperty({
    description: 'Valor de la condición en formato JSON',
    example: { min_amount: 100000 },
  })
  conditionValue: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Configuración adicional',
    example: {},
  })
  config?: any;

  @ApiPropertyOptional({
    description: 'Fecha de inicio de validez',
    example: '2024-11-01T00:00:00.000Z',
    type: String,
  })
  validFrom?: string | null;

  @ApiPropertyOptional({
    description: 'Fecha de fin de validez',
    example: '2024-12-31T23:59:59.000Z',
    type: String,
  })
  validTo?: string | null;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: string;

  @ApiProperty({
    description: 'Indica si la condición está activa',
    example: true,
    type: Boolean,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Indica si la condición es válida ahora (según fechas)',
    example: true,
    type: Boolean,
  })
  isValidNow: boolean;
}

