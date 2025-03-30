import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InventoryService } from '../inventory/inventory.service';
import { PrismaService } from '../../prisma/prisma.service';
import { addDays } from 'date-fns';

@Injectable()
export class SchedulerService {
  constructor(
    private readonly inventoryService: InventoryService,
    private readonly prisma: PrismaService,
  ) {}

  private async getProductIds(): Promise<number[]> {
    const products = await this.prisma.product.findMany({ select: { id: true } });
    return products.map((p) => p.id);
  }

  // 🔁 Every 15 minutes — fetch for today
  @Cron('*/15 * * * *')
  async fetchToday() {
    Logger.log('⏱️ Running 15-minute sync (today only)');
    const productIds = await this.getProductIds();
    const today = new Date();

    for (const id of productIds) {
      await this.inventoryService.fetchAndStoreInventory(id, today);
    }
  }

  // 🔁 Every 4 hours — next 7 days
  @Cron('0 */4 * * *')
  async fetchNext7Days() {
    Logger.log('⏱️ Running 4-hour sync (next 7 days)');
    const productIds = await this.getProductIds();

    for (let i = 0; i < 7; i++) {
      const date = addDays(new Date(), i);
      for (const id of productIds) {
        await this.inventoryService.fetchAndStoreInventory(id, date);
      }
    }
  }

  // 🔁 Every day — next 30 days
  @Cron('0 0 * * *')
  async fetchNext30Days() {
    Logger.log('⏱️ Running daily sync (next 30 days)');
    const productIds = await this.getProductIds();

    for (let i = 0; i < 30; i++) {
      const date = addDays(new Date(), i);
      for (const id of productIds) {
        await this.inventoryService.fetchAndStoreInventory(id, date);
      }
    }
  }
}
