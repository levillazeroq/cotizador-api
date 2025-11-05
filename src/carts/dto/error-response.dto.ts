import { ApiProperty } from '@nestjs/swagger'

export class ErrorResponseDto {
  @ApiProperty({ example: 404, description: 'Código de estado HTTP' })
  statusCode: number

  @ApiProperty({ example: 'Cart with ID cart_123456 not found', description: 'Mensaje de error' })
  message: string

  @ApiProperty({ example: 'Not Found', description: 'Tipo de error' })
  error: string
}

