import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PriceListConditionResponseDto } from './price-list-condition.response.dto';

export class PriceListResponseDto {
  @ApiProperty({
    description: 'ID único de la lista de precios',
    example: 1,
    type: Number,
  })
  id: number;

  @ApiProperty({
    description: 'Nombre de la lista de precios',
    example: 'Lista de Precios Mayorista',
    type: String,
  })
  name: string;

  @ApiProperty({
    description: 'Código de moneda (ISO 4217)',
    example: 'CLP',
    type: String,
  })
  currency: string;

  @ApiProperty({
    description: 'Indica si es la lista de precios por defecto',
    example: false,
    type: Boolean,
  })
  isDefault: boolean;

  @ApiProperty({
    description: 'Estado de la lista de precios',
    example: 'active',
    enum: ['active', 'inactive'],
  })
  status: string;

  @ApiPropertyOptional({
    description: 'Modo de impuestos para los precios',
    example: 'tax_included',
    enum: ['tax_included', 'tax_excluded'],
  })
  pricingTaxMode?: string;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Indica si la lista está activa',
    example: true,
    type: Boolean,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Indica si tiene modo de impuestos configurado',
    example: true,
    type: Boolean,
  })
  hasTaxMode: boolean;

  @ApiPropertyOptional({
    description: 'Condiciones de aplicación de la lista de precios',
    type: [PriceListConditionResponseDto],
    isArray: true,
  })
  conditions?: PriceListConditionResponseDto[];
}

export class PriceListsResponseDto {
  @ApiProperty({
    description: 'Lista de listas de precios',
    type: [PriceListResponseDto],
    isArray: true,
  })
  priceLists: PriceListResponseDto[];
}

