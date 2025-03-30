import { Controller, Get, Query, Param } from '@nestjs/common';
import { InventoryService } from './inventory.service';

@Controller('api/v1/experience')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get(':id/sync')
  async manualSync(@Param('id') id: string, @Query('date') date: string) {
    const productId = parseInt(id);
    const syncDate = new Date(date);
    return this.inventoryService.fetchAndStoreInventory(productId, syncDate);
  }

  @Get(':id/slots')
  async getSlots(@Param('id') id: string, @Query('date') date: string) {
    const productId = parseInt(id);
    return this.inventoryService.getSlotsByDate(productId, date);
  }

  @Get(':id/dates')
  async getDates(@Param('id') id: string) {
    const productId = parseInt(id);
    return this.inventoryService.getAvailableDates(productId);
  }
}
