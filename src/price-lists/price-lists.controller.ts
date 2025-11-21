import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Headers,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiHeader,
} from '@nestjs/swagger';
import { PriceListsService } from './price-lists.service';

@ApiTags('price-lists')
@Controller('price-lists')
export class PriceListsController {
  constructor(private readonly priceListsService: PriceListsService) {}

  @ApiOperation({
    summary: 'Obtener todas las listas de precios',
    description: 'Retorna todas las listas de precios de la organización.',
  })
  @ApiHeader({
    name: 'x-organization-id',
    description: 'ID de la organización',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Listas de precios obtenidas exitosamente',
  })
  @Get()
  async getPriceLists(
    @Headers('x-organization-id') organizationId: string,
  ) {
    return await this.priceListsService.get('/price-lists', {}, organizationId);
  }

  @ApiOperation({
    summary: 'Obtener lista de precios por ID',
    description: 'Retorna una lista de precios específica.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la lista de precios',
    example: '1',
    type: String,
  })
  @ApiHeader({
    name: 'x-organization-id',
    description: 'ID de la organización',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de precios obtenida exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Lista de precios no encontrada',
  })
  @Get(':id')
  async getPriceList(
    @Param('id') id: string,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return await this.priceListsService.get(`/price-lists/${id}`, {}, organizationId);
  }

  @ApiOperation({
    summary: 'Crear nueva lista de precios',
    description: 'Crea una nueva lista de precios.',
  })
  @ApiHeader({
    name: 'x-organization-id',
    description: 'ID de la organización',
    required: true,
  })
  @ApiResponse({
    status: 201,
    description: 'Lista de precios creada exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos',
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createPriceList(
    @Body() data: any,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return await this.priceListsService.post('/price-lists', data, organizationId);
  }

  @ApiOperation({
    summary: 'Actualizar lista de precios',
    description: 'Actualiza una lista de precios existente.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la lista de precios',
    example: '1',
    type: String,
  })
  @ApiHeader({
    name: 'x-organization-id',
    description: 'ID de la organización',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de precios actualizada exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Lista de precios no encontrada',
  })
  @Put(':id')
  async updatePriceList(
    @Param('id') id: string,
    @Body() data: any,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return await this.priceListsService.put(`/price-lists/${id}`, data, organizationId);
  }

  @ApiOperation({
    summary: 'Eliminar lista de precios',
    description: 'Elimina una lista de precios.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la lista de precios',
    example: '1',
    type: String,
  })
  @ApiHeader({
    name: 'x-organization-id',
    description: 'ID de la organización',
    required: true,
  })
  @ApiResponse({
    status: 204,
    description: 'Lista de precios eliminada exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Lista de precios no encontrada',
  })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePriceList(
    @Param('id') id: string,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return await this.priceListsService.delete(`/price-lists/${id}`, organizationId);
  }
}

