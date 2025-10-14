import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // GET /products
  @Get()
  async getProducts(@Query() query: any) {
    return await this.productsService.get('/products', query);
  }

  // GET /products/:id
  @Get(':id')
  async getProduct(@Param('id') id: string) {
    return await this.productsService.get(`/products/${id}`);
  }

  // POST /products
  @Post()
  async createProduct(@Body() data: any) {
    return await this.productsService.post('/products', data);
  }

  // PUT /products/:id
  @Put(':id')
  async updateProduct(@Param('id') id: string, @Body() data: any) {
    return await this.productsService.put(`/products/${id}`, data);
  }

  // PATCH /products/:id
  @Patch(':id')
  async partialUpdateProduct(@Param('id') id: string, @Body() data: any) {
    return await this.productsService.patch(`/products/${id}`, data);
  }

  // DELETE /products/:id
  @Delete(':id')
  async deleteProduct(@Param('id') id: string) {
    return await this.productsService.delete(`/products/${id}`);
  }

  // POST /products/upload
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadProduct(@UploadedFile() file: any) {
    const formData = new FormData();
    formData.append('file', file);
    return await this.productsService.upload('/products/upload', formData);
  }

  // GET /products/search
  @Get('search')
  async searchProducts(@Query() query: any) {
    return await this.productsService.get('/products/search', query);
  }

  // GET /products/categories
  @Get('categories')
  async getCategories(@Query() query: any) {
    return await this.productsService.get('/products/categories', query);
  }

  // GET /products/categories/:id
  @Get('categories/:id')
  async getCategory(@Param('id') id: string) {
    return await this.productsService.get(`/products/categories/${id}`);
  }

  // POST /products/categories
  @Post('categories')
  async createCategory(@Body() data: any) {
    return await this.productsService.post('/products/categories', data);
  }

  // PUT /products/categories/:id
  @Put('categories/:id')
  async updateCategory(@Param('id') id: string, @Body() data: any) {
    return await this.productsService.put(`/products/categories/${id}`, data);
  }

  // DELETE /products/categories/:id
  @Delete('categories/:id')
  async deleteCategory(@Param('id') id: string) {
    return await this.productsService.delete(`/products/categories/${id}`);
  }

  // GET /products/brands
  @Get('brands')
  async getBrands(@Query() query: any) {
    return await this.productsService.get('/products/brands', query);
  }

  // GET /products/brands/:id
  @Get('brands/:id')
  async getBrand(@Param('id') id: string) {
    return await this.productsService.get(`/products/brands/${id}`);
  }

  // POST /products/brands
  @Post('brands')
  async createBrand(@Body() data: any) {
    return await this.productsService.post('/products/brands', data);
  }

  // PUT /products/brands/:id
  @Put('brands/:id')
  async updateBrand(@Param('id') id: string, @Body() data: any) {
    return await this.productsService.put(`/products/brands/${id}`, data);
  }

  // DELETE /products/brands/:id
  @Delete('brands/:id')
  async deleteBrand(@Param('id') id: string) {
    return await this.productsService.delete(`/products/brands/${id}`);
  }
}
