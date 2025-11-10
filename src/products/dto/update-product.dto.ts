import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsObject,
  Min,
} from 'class-validator';

export class UpdateProductDto {
  @ApiPropertyOptional({
    description: 'Nombre del producto',
    example: 'Laptop Dell XPS 13 (Actualizado)',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Descripción breve del producto',
    example: 'Nueva descripción',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Descripción detallada del producto',
    example: 'Nueva descripción detallada...',
  })
  @IsOptional()
  @IsString()
  longDescription?: string;

  @ApiPropertyOptional({
    description: 'Precio del producto',
    example: 1399990,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({
    description: 'Categoría del producto',
    example: 'Laptops',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'Stock disponible',
    example: 20,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

  @ApiPropertyOptional({
    description: 'URL de la imagen principal',
    example: 'https://example.com/images/laptop-updated.jpg',
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'Array de URLs de imágenes adicionales',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({
    description: 'Marca del producto',
  })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({
    description: 'Variantes del producto',
    type: 'array',
  })
  @IsOptional()
  @IsArray()
  variants?: any[];

  @ApiPropertyOptional({
    description: 'Especificaciones técnicas del producto',
  })
  @IsOptional()
  @IsObject()
  specifications?: Record<string, any>;
}

