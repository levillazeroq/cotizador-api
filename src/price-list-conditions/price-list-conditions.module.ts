import { Module } from '@nestjs/common';
import { PriceListConditionsService } from './price-list-conditions.service';
import { PriceListConditionsController } from './price-list-conditions.controller';

@Module({
  controllers: [PriceListConditionsController],
  providers: [PriceListConditionsService],
  exports: [PriceListConditionsService],
})
export class PriceListConditionsModule {}

