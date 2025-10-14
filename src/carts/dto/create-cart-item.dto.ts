import { IsString, IsNumber, IsOptional, IsPositive, Min } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateCartItemDto {
  @ApiProperty({
    description: 'ID único del producto',
    example: 'prod_123456',
    type: String,
  })
  @IsString()
  productId: string

  @ApiProperty({
    description: 'Nombre del producto',
    example: 'Laptop Dell XPS 13',
    type: String,
  })
  @IsString()
  name: string

  @ApiProperty({
    description: 'Código SKU del producto',
    example: 'DELL-XPS13-2024',
    type: String,
  })
  @IsString()
  sku: string

  @ApiPropertyOptional({
    description: 'Tamaño del producto',
    example: '13 pulgadas',
    type: String,
  })
  @IsOptional()
  @IsString()
  size?: string

  @ApiPropertyOptional({
    description: 'Color del producto',
    example: 'Plata',
    type: String,
  })
  @IsOptional()
  @IsString()
  color?: string

  @ApiProperty({
    description: 'Precio del producto en pesos chilenos',
    example: 1299990,
    type: Number,
    minimum: 0,
  })
  @IsNumber()
  @IsPositive()
  price: number

  @ApiProperty({
    description: 'Cantidad del producto a agregar al carrito',
    example: 1,
    type: Number,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  quantity: number

  @ApiPropertyOptional({
    description: 'URL de la imagen del producto',
    example: 'https://example.com/images/laptop.jpg',
    type: String,
  })
  @IsOptional()
  @IsString()
  imageUrl?: string

  @ApiProperty({
    description: 'Stock máximo disponible del producto',
    example: 10,
    type: Number,
    minimum: 1,
  })
  @IsNumber()
  @IsPositive()
  maxStock: number
}
