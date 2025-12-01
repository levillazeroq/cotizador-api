import { Module, forwardRef } from '@nestjs/common';
import { PriceListsService } from './price-lists.service';
import { PriceListsController } from './price-lists.controller';
import { DatabaseModule } from '../database/database.module';
import { ProductsModule } from '../products/products.module';
import { PriceListRepository } from './repositories/price-list.repository';
// import { PriceListConditionRepository } from './repositories/price-list-condition.repository';
// import { TaxClassRepository } from './repositories/tax-class.repository';
import { ProductPriceRepository } from './repositories/product-price.repository';

@Module({
  imports: [DatabaseModule, forwardRef(() => ProductsModule)],
  controllers: [PriceListsController],
  providers: [
    PriceListsService,
    PriceListRepository,
    // PriceListConditionRepository,
    // TaxClassRepository,
    ProductPriceRepository,
  ],
  exports: [
    PriceListsService,
    PriceListRepository,
    // PriceListConditionRepository,
    // TaxClassRepository,
    ProductPriceRepository,
  ],
})
export class PriceListsModule {}

