import { IsNotEmpty, IsString, IsObject } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class UpdateCustomizationDto {
  @ApiProperty({
    description: 'Lista de IDs de productos seleccionados para personalizar',
    example: ['prod-123', 'prod-456'],
    type: [String],
  })
  @IsNotEmpty()
  @IsString({ each: true })
  selectedProductIds: string[]

  @ApiProperty({
    description: 'Valores de personalización por campo',
    example: {
      'field-1': 'Logo personalizado',
      'field-2': 'Azul',
      'field-3': true,
    },
    type: 'object',
    additionalProperties: true,
  })
  @IsNotEmpty()
  @IsObject()
  customizationValues: Record<string, any>
}

