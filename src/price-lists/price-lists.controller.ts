import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Headers,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiHeader,
  ApiQuery,
} from '@nestjs/swagger';
import { PriceListsService } from './price-lists.service';
import { CreatePriceListDto } from './dto/create-price-list.dto';
import { UpdatePriceListDto } from './dto/update-price-list.dto';
import {
  PriceListResponseDto,
  PriceListsResponseDto,
} from './dto/responses/price-list.response.dto';

@ApiTags('price-lists')
@Controller('price-lists')
export class PriceListsController {
  constructor(private readonly priceListsService: PriceListsService) {}

  @ApiOperation({
    summary: 'Obtener todas las listas de precios',
    description: 'Retorna todas las listas de precios de la organización con sus condiciones.',
  })
  @ApiHeader({
    name: 'x-organization-id',
    description: 'ID de la organización',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Listas de precios obtenidas exitosamente',
    type: PriceListsResponseDto,
  })
  @Get()
  async getPriceLists(
    @Headers('x-organization-id') organizationId: string,
    @Query('status') status?: string,
  ) {
    return await this.priceListsService.getPriceLists(organizationId, { status });
  }

  @ApiOperation({
    summary: 'Obtener lista de precios por ID',
    description: 'Retorna una lista de precios específica con todas sus condiciones.',
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
    type: PriceListResponseDto,
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
    return await this.priceListsService.getPriceListById(id, organizationId);
  }

  @ApiOperation({
    summary: 'Crear nueva lista de precios',
    description:
      'Crea una nueva lista de precios para la organización',
  })
  @ApiHeader({
    name: 'x-organization-id',
    description: 'ID de la organización',
    required: true,
  })
  @ApiResponse({
    status: 201,
    description: 'Lista de precios creada exitosamente',
    type: PriceListResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos',
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createPriceList(
    @Body() data: CreatePriceListDto,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return await this.priceListsService.createPriceList(data, organizationId);
  }

  @ApiOperation({
    summary: 'Actualizar lista de precios',
    description:
      'Actualiza una lista de precios existente. Si se cambia isDefault a true, automáticamente se quitará el flag de la lista por defecto anterior. Siempre debe existir al menos una lista por defecto.',
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
    type: PriceListResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'No se puede quitar el estado por defecto si es la única lista por defecto',
  })
  @ApiResponse({
    status: 404,
    description: 'Lista de precios no encontrada',
  })
  @Put(':id')
  async updatePriceList(
    @Param('id') id: string,
    @Body() data: UpdatePriceListDto,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return await this.priceListsService.updatePriceList(id, data, organizationId);
  }

  @ApiOperation({
    summary: 'Eliminar lista de precios',
    description:
      'Elimina una lista de precios de la organización. No se puede eliminar la lista por defecto.',
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
  @ApiResponse({
    status: 400,
    description: 'No se puede eliminar la lista por defecto',
  })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePriceList(
    @Param('id') id: string,
    @Headers('x-organization-id') organizationId: string,
  ): Promise<void> {
    await this.priceListsService.deletePriceList(id, organizationId);
  }

  @ApiOperation({
    summary: 'Obtener productos con precios de una lista de precios',
    description:
      'Retorna productos paginados que tienen precio configurado en esta lista de precios, con sus respectivos precios.',
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
  @ApiQuery({
    name: 'page',
    description: 'Número de página (por defecto: 1)',
    required: false,
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Cantidad de productos por página (por defecto: 20, máximo: 100)',
    required: false,
    type: Number,
    example: 20,
  })
  @ApiQuery({
    name: 'search',
    description: 'Buscar por SKU o nombre de producto',
    required: false,
    type: String,
    example: 'laptop',
  })
  @ApiResponse({
    status: 200,
    description: 'Productos con precios obtenidos exitosamente',
    schema: {
      type: 'object',
      properties: {
        products: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              name: { type: 'string' },
              sku: { type: 'string' },
              description: { type: 'string', nullable: true },
              imageUrl: { type: 'string', nullable: true },
              price: {
                type: 'object',
                nullable: true,
                properties: {
                  id: { type: 'number' },
                  amount: { type: 'string' },
                  currency: { type: 'string' },
                  taxIncluded: { type: 'boolean' },
                  validFrom: { type: 'string', nullable: true, format: 'date-time' },
                  validTo: { type: 'string', nullable: true, format: 'date-time' },
                },
              },
            },
          },
        },
        total: { type: 'number', description: 'Total de productos con precio en esta lista' },
        page: { type: 'number', description: 'Página actual' },
        limit: { type: 'number', description: 'Productos por página' },
        totalPages: { type: 'number', description: 'Total de páginas' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Lista de precios no encontrada',
  })
  @Get(':id/products')
  async getPriceListProducts(
    @Param('id') id: string,
    @Headers('x-organization-id') organizationId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 20;
    
    return await this.priceListsService.getPriceListProducts(
      id,
      organizationId,
      pageNumber,
      limitNumber,
      search,
    );
  }
}

