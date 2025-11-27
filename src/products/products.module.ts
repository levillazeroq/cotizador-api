import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { DatabaseModule } from '../database/database.module';
import { ProductRepository } from './repositories/product.repository';
import { ProductMediaRepository } from './repositories/product-media.repository';
import { ProductRelationRepository } from './repositories/product-relation.repository';

@Module({
  imports: [DatabaseModule],
  controllers: [ProductsController],
  providers: [
    ProductsService,
    ProductRepository,
    ProductMediaRepository,
    ProductRelationRepository,
  ],
  exports: [
    ProductsService,
    ProductRepository,
    ProductMediaRepository,
    ProductRelationRepository,
  ],
})
export class ProductsModule {}
