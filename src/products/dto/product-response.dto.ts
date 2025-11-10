import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class VariantDto {
  @ApiProperty({ example: 'var_1', description: 'ID de la variante' })
  id: string;

  @ApiProperty({ example: 'Color', description: 'Nombre de la variante' })
  name: string;

  @ApiProperty({
    example: ['Azul', 'Rojo', 'Negro'],
    description: 'Opciones disponibles',
  })
  options: any[];
}

export class ProductResponseDto {
  @ApiProperty({
    example: 'prod_123456',
    description: 'ID único del producto',
  })
  id: string;

  @ApiProperty({
    example: 'Laptop Dell XPS 13',
    description: 'Nombre del producto',
  })
  name: string;

  @ApiPropertyOptional({
    example: 'Laptop ultradelgada con procesador Intel i7',
    description: 'Descripción breve del producto',
  })
  description?: string;

  @ApiPropertyOptional({
    example: 'Descripción detallada del producto...',
    description: 'Descripción detallada del producto',
  })
  longDescription?: string;

  @ApiProperty({
    example: 1299990,
    description: 'Precio del producto',
  })
  price: number;

  @ApiProperty({
    example: 'Laptops',
    description: 'Categoría del producto',
  })
  category: string;

  @ApiProperty({
    example: 'DELL-XPS13-2024',
    description: 'SKU del producto',
  })
  sku: string;

  @ApiProperty({
    example: 15,
    description: 'Stock disponible',
  })
  stock: number;

  @ApiPropertyOptional({
    example: 'https://example.com/images/laptop.jpg',
    description: 'URL de la imagen principal',
  })
  imageUrl?: string;

  @ApiPropertyOptional({
    example: [
      'https://example.com/images/laptop1.jpg',
      'https://example.com/images/laptop2.jpg',
    ],
    description: 'Array de URLs de imágenes adicionales',
    type: [String],
  })
  images?: string[];

  @ApiPropertyOptional({
    type: [VariantDto],
    description: 'Variantes del producto',
  })
  variants?: VariantDto[];

  @ApiPropertyOptional({
    example: {
      processor: 'Intel i7',
      ram: '16GB',
      storage: '512GB SSD',
    },
    description: 'Especificaciones técnicas del producto',
  })
  specifications?: Record<string, any>;

  @ApiPropertyOptional({
    example: 'Dell',
    description: 'Marca del producto',
  })
  brand?: string;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Fecha de creación',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Fecha de actualización',
  })
  updatedAt: Date;
}

