import {
  Controller,
  Get,
  Put,
  Body,
  Query,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  // 1. GET /inventory - Get all inventory (with optional filters)
  @Get()
  async getInventory(@Query() query: any) {
    return await this.inventoryService.get('/inventory', query);
  }

  // 2. GET /inventory/aggregated - Get aggregated inventory data
  @Get('aggregated')
  async getAggregatedInventory(@Query() query: any) {
    return await this.inventoryService.get('/inventory/aggregated', query);
  }

  // 3. GET /inventory?product_id=xxx - Get inventory by product (using query param)
  // This is handled by the main GET endpoint with product_id filter

  // 4. GET /inventory?location_id=xxx - Get inventory by location (using query param)
  // This is handled by the main GET endpoint with location_id filter

  // 5. PUT /inventory - Update inventory
  @Put()
  async updateInventory(@Body() data: any) {
    return await this.inventoryService.put('/inventory', data);
  }
}
