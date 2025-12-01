import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { InventoryLevelRepository } from './inventory-level.repository';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [InventoryController],
  providers: [InventoryService, InventoryLevelRepository],
  exports: [InventoryService, InventoryLevelRepository],
})
export class InventoryModule {}
