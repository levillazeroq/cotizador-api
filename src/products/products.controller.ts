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

  // PATCH /products/:id
  @Put(':id')
  async partialUpdateProduct(@Param('id') id: string, @Body() data: any) {
    return await this.productsService.put(`/products/${id}`, data);
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
}
