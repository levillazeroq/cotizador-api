import { ApiProperty } from '@nestjs/swagger';

export class UploadProductsDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Archivo CSV o Excel con los productos',
  })
  file: any;
}

export class UploadProductsResponseDto {
  @ApiProperty({
    example: true,
    description: 'Indica si la carga fue exitosa',
  })
  success: boolean;

  @ApiProperty({
    example: 150,
    description: 'Número de productos importados exitosamente',
  })
  imported: number;

  @ApiProperty({
    example: [],
    description: 'Lista de errores durante la importación',
    type: 'array',
  })
  errors: any[];

  @ApiProperty({
    example: '150 productos importados exitosamente',
    description: 'Mensaje descriptivo del resultado',
  })
  message: string;
}

