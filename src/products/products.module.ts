import { Module, forwardRef } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { DatabaseModule } from '../database/database.module';
import { ProductRepository } from './repositories/product.repository';
import { ProductMediaRepository } from './repositories/product-media.repository';
import { ProductRelationRepository } from './repositories/product-relation.repository';
import { InventoryService } from '../inventory/inventory.service';
import { InventoryLevelRepository } from '../inventory/inventory-level.repository';
import { PriceListsModule } from '../price-lists/price-lists.module';

@Module({
  imports: [DatabaseModule, forwardRef(() => PriceListsModule)],
  controllers: [ProductsController],
  providers: [
    ProductsService,
    ProductRepository,
    ProductMediaRepository,
    ProductRelationRepository,
    InventoryService,
    InventoryLevelRepository,
    ],
  exports: [
    ProductsService,
    ProductRepository,
    ProductMediaRepository,
    ProductRelationRepository,
  ],
})
export class ProductsModule {}
