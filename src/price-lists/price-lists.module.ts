import { Module } from '@nestjs/common';
import { PriceListsService } from './price-lists.service';
import { PriceListsController } from './price-lists.controller';
import { DatabaseModule } from '../database/database.module';
import { PriceListRepository } from './repositories/price-list.repository';
import { PriceListConditionRepository } from './repositories/price-list-condition.repository';
import { TaxClassRepository } from './repositories/tax-class.repository';

@Module({
  imports: [DatabaseModule],
  controllers: [PriceListsController],
  providers: [
    PriceListsService,
    PriceListRepository,
    PriceListConditionRepository,
    TaxClassRepository,
  ],
  exports: [
    PriceListsService,
    PriceListRepository,
    PriceListConditionRepository,
    TaxClassRepository,
  ],
})
export class PriceListsModule {}

