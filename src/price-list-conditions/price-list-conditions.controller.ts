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
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiHeader,
  ApiQuery,
} from '@nestjs/swagger';
import { PriceListConditionsService } from './price-list-conditions.service';

@ApiTags('price-list-conditions')
@Controller('price-lists/:priceListId/conditions')
export class PriceListConditionsController {
  constructor(
    private readonly priceListConditionsService: PriceListConditionsService,
  ) {}

  @ApiOperation({
    summary: 'Obtener condiciones de una lista de precios',
    description: 'Retorna todas las condiciones asociadas a una lista de precios con soporte de paginación.',
  })
  @ApiParam({
    name: 'priceListId',
    description: 'ID de la lista de precios',
    example: '1',
    type: String,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Número de página',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Cantidad de elementos por página',
    example: 10,
  })
  @ApiHeader({
    name: 'x-organization-id',
    description: 'ID de la organización',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Condiciones obtenidas exitosamente',
  })
  @Get()
  async getConditions(
    @Param('priceListId') priceListId: string,
    @Query() query: any,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return await this.priceListConditionsService.get(
      `/price-lists/${priceListId}/conditions`,
      query,
      organizationId,
    );
  }

  @ApiOperation({
    summary: 'Obtener condición por ID',
    description: 'Retorna una condición específica de una lista de precios.',
  })
  @ApiParam({
    name: 'priceListId',
    description: 'ID de la lista de precios',
    example: '1',
    type: String,
  })
  @ApiParam({
    name: 'conditionId',
    description: 'ID de la condición',
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
    description: 'Condición obtenida exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Condición no encontrada',
  })
  @Get(':conditionId')
  async getCondition(
    @Param('priceListId') priceListId: string,
    @Param('conditionId') conditionId: string,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return await this.priceListConditionsService.get(
      `/price-lists/${priceListId}/conditions/${conditionId}`,
      {},
      organizationId,
    );
  }

  @ApiOperation({
    summary: 'Crear nueva condición',
    description: 'Crea una nueva condición para una lista de precios.',
  })
  @ApiParam({
    name: 'priceListId',
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
    status: 201,
    description: 'Condición creada exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos',
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createCondition(
    @Param('priceListId') priceListId: string,
    @Body() data: any,
    @Headers('x-organization-id') organizationId: string,
  ) {
    // Validar que solo se permiten condiciones de tipo "amount"
    if (data.conditionType && data.conditionType !== 'amount') {
      throw new BadRequestException(
        'Actualmente solo se permiten condiciones de tipo "amount". Otros tipos de condiciones no están soportados.',
      );
    }

    // Si no se especifica el tipo, establecerlo como "amount" por defecto
    if (!data.conditionType) {
      data.conditionType = 'amount';
    }

    return await this.priceListConditionsService.post(
      `/price-lists/${priceListId}/conditions`,
      data,
      organizationId,
    );
  }

  @ApiOperation({
    summary: 'Actualizar condición',
    description: 'Actualiza una condición existente.',
  })
  @ApiParam({
    name: 'priceListId',
    description: 'ID de la lista de precios',
    example: '1',
    type: String,
  })
  @ApiParam({
    name: 'conditionId',
    description: 'ID de la condición',
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
    description: 'Condición actualizada exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Condición no encontrada',
  })
  @Put(':conditionId')
  async updateCondition(
    @Param('priceListId') priceListId: string,
    @Param('conditionId') conditionId: string,
    @Body() data: any,
    @Headers('x-organization-id') organizationId: string,
  ) {
    // Validar que solo se permiten condiciones de tipo "amount"
    if (data.conditionType && data.conditionType !== 'amount') {
      throw new BadRequestException(
        'Actualmente solo se permiten condiciones de tipo "amount". Otros tipos de condiciones no están soportados.',
      );
    }

    return await this.priceListConditionsService.put(
      `/price-lists/${priceListId}/conditions/${conditionId}`,
      data,
      organizationId,
    );
  }

  @ApiOperation({
    summary: 'Eliminar condición',
    description: 'Elimina una condición de una lista de precios.',
  })
  @ApiParam({
    name: 'priceListId',
    description: 'ID de la lista de precios',
    example: '1',
    type: String,
  })
  @ApiParam({
    name: 'conditionId',
    description: 'ID de la condición',
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
    description: 'Condición eliminada exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Condición no encontrada',
  })
  @Delete(':conditionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCondition(
    @Param('priceListId') priceListId: string,
    @Param('conditionId') conditionId: string,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return await this.priceListConditionsService.delete(
      `/price-lists/${priceListId}/conditions/${conditionId}`,
      organizationId,
    );
  }
}

