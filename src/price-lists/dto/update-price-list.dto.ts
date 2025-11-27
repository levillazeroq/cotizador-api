import { IsString, IsBoolean, IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

enum PricingTaxMode {
  TAX_INCLUDED = 'tax_included',
  TAX_EXCLUDED = 'tax_excluded',
}

enum PriceListStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export class UpdatePriceListDto {
  @ApiPropertyOptional({
    description: 'Nombre de la lista de precios',
    example: 'Lista de Precios Mayorista',
    type: String,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Código de moneda (ISO 4217)',
    example: 'CLP',
    type: String,
  })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({
    description: 'Indica si es la lista de precios por defecto',
    example: false,
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({
    description: 'Estado de la lista de precios',
    example: 'active',
    enum: PriceListStatus,
  })
  @IsOptional()
  @IsEnum(PriceListStatus)
  status?: string;

  @ApiPropertyOptional({
    description: 'Modo de impuestos para los precios',
    example: 'tax_included',
    enum: PricingTaxMode,
  })
  @IsOptional()
  @IsEnum(PricingTaxMode)
  pricingTaxMode?: string;
}

