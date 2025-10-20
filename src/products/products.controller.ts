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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
  ApiConsumes,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @ApiOperation({
    summary: 'Obtener todos los productos',
    description: 'Retorna una lista de productos con soporte para filtrado, búsqueda, paginación y ordenamiento. Conectado al sistema externo de productos.',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Término de búsqueda para filtrar productos por nombre o descripción',
    example: 'laptop',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    type: String,
    description: 'Filtrar productos por categoría',
    example: 'electronics',
  })
  @ApiQuery({
    name: 'minPrice',
    required: false,
    type: Number,
    description: 'Precio mínimo para filtrar productos',
    example: 100000,
  })
  @ApiQuery({
    name: 'maxPrice',
    required: false,
    type: Number,
    description: 'Precio máximo para filtrar productos',
    example: 500000,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número de página para paginación',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Cantidad de productos por página',
    example: 20,
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    type: String,
    description: 'Campo por el cual ordenar los resultados',
    example: 'price',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    type: String,
    description: 'Orden de clasificación (asc o desc)',
    example: 'asc',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de productos obtenida exitosamente',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'prod_123456' },
              name: { type: 'string', example: 'Laptop Dell XPS 13' },
              description: { type: 'string', example: 'Laptop ultradelgada con procesador Intel i7' },
              price: { type: 'number', example: 1299990 },
              category: { type: 'string', example: 'Laptops' },
              sku: { type: 'string', example: 'DELL-XPS13-2024' },
              stock: { type: 'number', example: 15 },
              imageUrl: { type: 'string', example: 'https://example.com/images/laptop.jpg' },
              variants: { type: 'array', items: {} },
            },
          },
        },
        pagination: {
          type: 'object',
          properties: {
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 20 },
            total: { type: 'number', example: 150 },
            totalPages: { type: 'number', example: 8 },
          },
        },
      },
    },
  })
  @Get()
  async getProducts(@Query() query: any) {
    return await this.productsService.get('/products', query);
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
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'prod_123456' },
        name: { type: 'string', example: 'Laptop Dell XPS 13' },
        description: { type: 'string', example: 'Laptop ultradelgada con procesador Intel i7' },
        longDescription: { type: 'string', example: 'Descripción detallada del producto...' },
        price: { type: 'number', example: 1299990 },
        category: { type: 'string', example: 'Laptops' },
        sku: { type: 'string', example: 'DELL-XPS13-2024' },
        stock: { type: 'number', example: 15 },
        imageUrl: { type: 'string', example: 'https://example.com/images/laptop.jpg' },
        images: { type: 'array', items: { type: 'string' } },
        variants: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              options: { type: 'array', items: {} },
            },
          },
        },
        specifications: { type: 'object' },
        brand: { type: 'string', example: 'Dell' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Producto no encontrado',
  })
  @Get(':id')
  async getProduct(@Param('id') id: string) {
    return await this.productsService.get(`/products/${id}`);
  }

  @ApiOperation({
    summary: 'Crear nuevo producto',
    description: 'Registra un nuevo producto en el catálogo. Requiere permisos de administrador.',
  })
  @ApiBody({
    description: 'Datos del producto a crear',
    schema: {
      type: 'object',
      required: ['name', 'price', 'category', 'sku'],
      properties: {
        name: { type: 'string', example: 'Laptop Dell XPS 13' },
        description: { type: 'string', example: 'Laptop ultradelgada con procesador Intel i7' },
        longDescription: { type: 'string', example: 'Descripción detallada...' },
        price: { type: 'number', example: 1299990 },
        category: { type: 'string', example: 'Laptops' },
        sku: { type: 'string', example: 'DELL-XPS13-2024' },
        stock: { type: 'number', example: 15 },
        imageUrl: { type: 'string', example: 'https://example.com/images/laptop.jpg' },
        images: { type: 'array', items: { type: 'string' } },
        brand: { type: 'string', example: 'Dell' },
        variants: { type: 'array', items: {} },
        specifications: { type: 'object' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Producto creado exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o error de validación',
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createProduct(@Body() data: any) {
    return await this.productsService.post('/products', data);
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
  @ApiBody({
    description: 'Datos del producto a actualizar',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Laptop Dell XPS 13 (Actualizado)' },
        description: { type: 'string', example: 'Nueva descripción' },
        price: { type: 'number', example: 1399990 },
        stock: { type: 'number', example: 20 },
        category: { type: 'string', example: 'Laptops' },
        imageUrl: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Producto actualizado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Producto no encontrado',
  })
  @Put(':id')
  async partialUpdateProduct(@Param('id') id: string, @Body() data: any) {
    return await this.productsService.put(`/products/${id}`, data);
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
  async deleteProduct(@Param('id') id: string) {
    return await this.productsService.delete(`/products/${id}`);
  }

  @ApiOperation({
    summary: 'Cargar productos desde archivo',
    description: 'Permite cargar productos masivamente desde un archivo CSV o Excel. Útil para importaciones grandes de productos.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Archivo con los productos a importar (CSV o Excel)',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Archivo CSV o Excel con los productos',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Productos cargados exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        imported: { type: 'number', example: 150 },
        errors: { type: 'array', items: {} },
        message: { type: 'string', example: '150 productos importados exitosamente' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Archivo inválido o formato incorrecto',
  })
  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  async uploadProduct(@UploadedFile() file: any) {
    const formData = new FormData();
    formData.append('file', file);
    return await this.productsService.upload('/products/upload', formData);
  }
}
