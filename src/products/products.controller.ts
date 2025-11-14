import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
  Headers,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiConsumes,
  ApiHeader,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import {
  ProductFiltersDto,
  CreateProductDto,
  UpdateProductDto,
  ProductResponseDto,
  PaginatedProductsDto,
  UploadProductsResponseDto,
  CreateProductMediaDto,
  UpdateProductMediaDto
} from './dto';

@ApiTags('products')
@ApiHeader({
  name: 'X-Organization-ID',
  description: 'ID de la organización',
  required: true,
})
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @ApiOperation({
    summary: 'Obtener todos los productos',
    description: 'Retorna una lista de productos con soporte para filtrado, búsqueda, paginación y ordenamiento. Conectado al sistema externo de productos.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de productos obtenida exitosamente',
    type: PaginatedProductsDto,
  })
  @Get()
  async getProducts(
    @Query() filters: ProductFiltersDto,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return await this.productsService.get('/products', filters, organizationId);
  }

  @ApiOperation({
    summary: 'Obtener producto por ID',
    description: 'Retorna un producto específico con todos sus detalles, variantes, especificaciones y disponibilidad.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del producto',
    example: 'prod_123456',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Producto obtenido exitosamente',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Producto no encontrado',
  })
  @Get(':id')
  async getProduct(
    @Param('id') id: string,
    @Query() query: any,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return await this.productsService.get(`/products/${id}`, query, organizationId);
  }

  @ApiOperation({
    summary: 'Crear nuevo producto',
    description: 'Registra un nuevo producto en el catálogo. Requiere permisos de administrador.',
  })
  @ApiResponse({
    status: 201,
    description: 'Producto creado exitosamente',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o error de validación',
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createProduct(
    @Body() createProductDto: CreateProductDto,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return await this.productsService.post('/products', createProductDto, organizationId);
  }

  @ApiOperation({
    summary: 'Actualizar producto',
    description: 'Actualiza un producto existente. Puede actualizar parcial o totalmente los datos del producto.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del producto a actualizar',
    example: 'prod_123456',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Producto actualizado exitosamente',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Producto no encontrado',
  })
  @Put(':id')
  async partialUpdateProduct(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return await this.productsService.put(`/products/${id}`, updateProductDto, organizationId);
  }

  @ApiOperation({
    summary: 'Eliminar producto',
    description: 'Elimina permanentemente un producto del catálogo. ADVERTENCIA: esto puede afectar cotizaciones existentes que incluyan este producto.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del producto a eliminar',
    example: 'prod_123456',
    type: String,
  })
  @ApiResponse({
    status: 204,
    description: 'Producto eliminado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Producto no encontrado',
  })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProduct(
    @Param('id') id: string,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return await this.productsService.delete(`/products/${id}`, organizationId);
  }

  @ApiOperation({
    summary: 'Cargar productos desde archivo',
    description: 'Permite cargar productos masivamente desde un archivo CSV o Excel. Útil para importaciones grandes de productos.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: 'Productos cargados exitosamente',
    type: UploadProductsResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Archivo inválido o formato incorrecto',
  })
  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  async uploadProduct(
    @UploadedFile() file: any,
    @Headers('x-organization-id') organizationId: string,
  ) {
    const formData = new FormData();
    formData.append('file', file);
    return await this.productsService.upload('/products/upload', formData, organizationId);
  }

  @ApiOperation({
    summary: 'Agregar media a producto',
    description: 'Agrega una imagen o video a un producto.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del producto',
    example: '4263',
    type: String,
  })
  @ApiResponse({
    status: 201,
    description: 'Media agregado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Producto no encontrado',
  })
  @Post(':id/media')
  @HttpCode(HttpStatus.CREATED)
  async addMedia(
    @Param('id') id: string,
    @Body() media: CreateProductMediaDto,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return await this.productsService.post(`/products/${id}/media`, media, organizationId);
  }

  @ApiOperation({
    summary: 'Actualizar media de producto',
    description: 'Actualiza una media específica de un producto.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del producto',
    example: '4263',
    type: String,
  })
  @ApiParam({
    name: 'mediaId',
    description: 'ID del media a actualizar',
    example: 'media_123',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Media actualizado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Producto o media no encontrado',
  })
  @Put(':id/media/:mediaId')
  async updateMedia(
    @Param('id') id: string,
    @Param('mediaId') mediaId: string,
    @Body() media: UpdateProductMediaDto,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return await this.productsService.put(`/products/${id}/media/${mediaId}`, media, organizationId);
  }

  @ApiOperation({
    summary: 'Eliminar media de producto',
    description: 'Elimina una media específica de un producto.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del producto',
    example: '4263',
    type: String,
  })
  @ApiParam({
    name: 'mediaId',
    description: 'ID del media',
    example: 'media_123',
    type: String,
  })
  @ApiResponse({
    status: 204,
    description: 'Media eliminado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Producto o media no encontrado',
  })
  @Delete(':id/media/:mediaId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMedia(
    @Param('id') id: string,
    @Param('mediaId') mediaId: string,
    @Headers('x-organization-id') organizationId: string,
  ) {
    return await this.productsService.delete(`/products/${id}/media/${mediaId}`, organizationId);
  }
}
