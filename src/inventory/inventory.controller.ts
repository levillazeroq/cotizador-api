import {
  Controller,
  Get,
  Put,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { InventoryService } from './inventory.service';

@ApiTags('inventory')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @ApiOperation({
    summary: 'Obtener inventario',
    description: 'Retorna el inventario de productos con soporte para filtrado por producto, ubicación y disponibilidad. Conectado al sistema externo de inventario.',
  })
  @ApiQuery({
    name: 'product_id',
    required: false,
    type: String,
    description: 'Filtrar inventario por ID de producto específico',
    example: 'prod_123456',
  })
  @ApiQuery({
    name: 'location_id',
    required: false,
    type: String,
    description: 'Filtrar inventario por ubicación/sucursal específica',
    example: 'loc_789',
  })
  @ApiQuery({
    name: 'sku',
    required: false,
    type: String,
    description: 'Filtrar inventario por SKU del producto',
    example: 'DELL-XPS13-2024',
  })
  @ApiQuery({
    name: 'minStock',
    required: false,
    type: Number,
    description: 'Filtrar productos con stock mínimo',
    example: 5,
  })
  @ApiQuery({
    name: 'inStock',
    required: false,
    type: Boolean,
    description: 'Filtrar solo productos con stock disponible',
    example: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Inventario obtenido exitosamente',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'inv_123456' },
          productId: { type: 'string', example: 'prod_123456' },
          productName: { type: 'string', example: 'Laptop Dell XPS 13' },
          sku: { type: 'string', example: 'DELL-XPS13-2024' },
          locationId: { type: 'string', example: 'loc_789' },
          locationName: { type: 'string', example: 'Bodega Central' },
          quantity: { type: 'number', example: 15 },
          reserved: { type: 'number', example: 3 },
          available: { type: 'number', example: 12 },
          minStock: { type: 'number', example: 5 },
          maxStock: { type: 'number', example: 50 },
          status: { type: 'string', example: 'in_stock', enum: ['in_stock', 'low_stock', 'out_of_stock'] },
          lastUpdated: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  @Get()
  async getInventory(@Query() query: any) {
    return await this.inventoryService.getInventory(query);
  }

  @ApiOperation({
    summary: 'Actualizar inventario',
    description: 'Actualiza la cantidad de stock para uno o múltiples productos en el inventario. Puede ser usado para ajustes de inventario, recepciones o movimientos.',
  })
  @ApiBody({
    description: 'Datos de actualización del inventario',
    schema: {
      type: 'object',
      properties: {
        updates: {
          type: 'array',
          items: {
            type: 'object',
            required: ['productId', 'locationId'],
            properties: {
              productId: { type: 'string', example: 'prod_123456' },
              locationId: { type: 'string', example: 'loc_789' },
              quantity: { type: 'number', example: 20, description: 'Nueva cantidad total' },
              adjustment: { type: 'number', example: 5, description: 'Ajuste incremental (+/-) en lugar de cantidad absoluta' },
              reason: { type: 'string', example: 'Recepción de mercancía', description: 'Motivo del ajuste' },
            },
          },
        },
        bulkUpdate: {
          type: 'boolean',
          example: false,
          description: 'Si es true, procesa todas las actualizaciones como una transacción',
        },
      },
      example: {
        updates: [
          {
            productId: 'prod_123456',
            locationId: 'loc_789',
            adjustment: 10,
            reason: 'Recepción de mercancía',
          },
          {
            productId: 'prod_789',
            locationId: 'loc_789',
            quantity: 25,
            reason: 'Conteo físico',
          },
        ],
        bulkUpdate: true,
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Inventario actualizado exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        updated: { type: 'number', example: 2 },
        results: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              productId: { type: 'string' },
              locationId: { type: 'string' },
              previousQuantity: { type: 'number' },
              newQuantity: { type: 'number' },
              status: { type: 'string', example: 'success' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o error en la actualización',
  })
  @Put()
  @HttpCode(HttpStatus.OK)
  async updateInventory(@Body() data: any) {
    return await this.inventoryService.updateInventory(data);
  }
}
