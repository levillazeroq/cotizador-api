import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsUrl,
  Min,
} from 'class-validator';
import { MediaType } from './create-product-media.dto';

export class UpdateProductMediaDto {
  @ApiPropertyOptional({
    description: 'URL del archivo de media',
    example: 'https://texora.cl/4342-home_default/polera-hibrida-dual-hi-vis-hombre-mlarga.jpg',
  })
  @IsOptional()
  @IsUrl()
  @IsString()
  url?: string;

  @ApiPropertyOptional({
    description: 'Tipo de media',
    enum: MediaType,
    example: 'image',
  })
  @IsOptional()
  @IsEnum(MediaType)
  type?: MediaType;

  @ApiPropertyOptional({
    description: 'Texto alternativo para la imagen',
    example: 'Imagen principal del producto',
  })
  @IsOptional()
  @IsString()
  alt_text?: string;

  @ApiPropertyOptional({
    description: 'Indica si es la imagen principal',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  is_primary?: boolean;

  @ApiPropertyOptional({
    description: 'Orden de visualización',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sort_order?: number;
}

