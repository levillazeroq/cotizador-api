import { ApiProperty } from '@nestjs/swagger';

export class PaginationMeta {
  @ApiProperty({ description: 'Total number of items' })
  total: number;

  @ApiProperty({ description: 'Current page number' })
  page: number;

  @ApiProperty({ description: 'Number of items per page' })
  limit: number;

  @ApiProperty({ description: 'Total number of pages' })
  totalPages: number;
}

export class PaginatedPaymentsDto {
  @ApiProperty({ 
    description: 'Array of payments',
    type: 'array',
    items: {
      type: 'object'
    }
  })
  data: any[];

  @ApiProperty({ type: PaginationMeta, description: 'Pagination metadata' })
  pagination: PaginationMeta;
}

