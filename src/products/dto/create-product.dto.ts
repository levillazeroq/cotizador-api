import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsObject,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    description: 'Nombre del producto',
    example: 'Laptop Dell XPS 13',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Descripción breve del producto',
    example: 'Laptop ultradelgada con procesador Intel i7',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Descripción detallada del producto',
    example: 'Descripción detallada...',
  })
  @IsOptional()
  @IsString()
  longDescription?: string;

  @ApiProperty({
    description: 'Precio del producto',
    example: 1299990,
  })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    description: 'Categoría del producto',
    example: 'Laptops',
  })
  @IsString()
  category: string;

  @ApiProperty({
    description: 'SKU del producto',
    example: 'DELL-XPS13-2024',
  })
  @IsString()
  sku: string;

  @ApiPropertyOptional({
    description: 'Stock disponible',
    example: 15,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

  @ApiPropertyOptional({
    description: 'URL de la imagen principal',
    example: 'https://example.com/images/laptop.jpg',
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'Array de URLs de imágenes adicionales',
    example: ['https://example.com/images/laptop1.jpg', 'https://example.com/images/laptop2.jpg'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({
    description: 'Marca del producto',
    example: 'Dell',
  })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({
    description: 'Variantes del producto',
    example: [
      {
        id: 'var_1',
        name: 'Color',
        options: ['Azul', 'Rojo', 'Negro'],
      },
    ],
    type: 'array',
  })
  @IsOptional()
  @IsArray()
  variants?: any[];

  @ApiPropertyOptional({
    description: 'Especificaciones técnicas del producto',
    example: {
      processor: 'Intel i7',
      ram: '16GB',
      storage: '512GB SSD',
    },
  })
  @IsOptional()
  @IsObject()
  specifications?: Record<string, any>;
}

