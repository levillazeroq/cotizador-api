import { ApiProperty } from '@nestjs/swagger';
import { ProductResponseDto } from './product-response.dto';

class PaginationMetaDto {
  @ApiProperty({ example: 1, description: 'Página actual' })
  page: number;

  @ApiProperty({ example: 20, description: 'Productos por página' })
  limit: number;

  @ApiProperty({ example: 150, description: 'Total de productos' })
  total: number;

  @ApiProperty({ example: 8, description: 'Total de páginas' })
  totalPages: number;
}

export class PaginatedProductsDto {
  @ApiProperty({
    type: [ProductResponseDto],
    description: 'Lista de productos',
  })
  data: ProductResponseDto[];

  @ApiProperty({
    type: PaginationMetaDto,
    description: 'Metadatos de paginación',
  })
  pagination: PaginationMetaDto;
}

