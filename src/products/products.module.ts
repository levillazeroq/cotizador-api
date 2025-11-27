import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { DatabaseModule } from '../database/database.module';
import { ProductRepository } from './repositories/product.repository';
import { ProductMediaRepository } from './repositories/product-media.repository';

@Module({
  imports: [DatabaseModule],
  controllers: [ProductsController],
  providers: [
    ProductsService,
    ProductRepository,
    ProductMediaRepository,
  ],
  exports: [
    ProductsService,
    ProductRepository,
    ProductMediaRepository,
  ],
})
export class ProductsModule {}
