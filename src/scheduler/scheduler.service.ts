import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InventoryService } from '../inventory/inventory.service';
import { PrismaService } from '../../prisma/prisma.service';
import { addDays, format } from 'date-fns';
import { enUS } from 'date-fns/locale';

@Injectable()
export class SchedulerService {
  constructor(
    private readonly inventoryService: InventoryService,
    private readonly prisma: PrismaService,
  ) {}

  //  Utility to get day name like "Monday"
  private getDayName(date: Date): string {
    return format(date, 'EEEE', { locale: enUS });
  }

  //  Core function that handles rate-limited sync
  public async rateLimitedFetch(productIds: number[], days: number) {
    const delay = 2200; // Wait ~2.2s between each request (to stay within 30rpm)

    // Get all relevant products with their availableDays
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, availableDays: true },
    });

    const tasks: (() => Promise<void>)[] = [];

    for (const product of products) {
      for (let dayOffset = 0; dayOffset < days; dayOffset++) {
        const date = addDays(new Date(), dayOffset);
        const dayName = this.getDayName(date);

        if (product.availableDays.includes(dayName)) {
          tasks.push(() => this.inventoryService.fetchAndStoreInventory(product.id, date));
        } else {
          Logger.log(`Skipping ${dayName} for product ${product.id} — not in availableDays`);
        }
      }
    }

    for (let i = 0; i < tasks.length; i++) {
      Logger.log(`⏳ [${i + 1}/${tasks.length}] Executing rate-limited sync...`);
      await tasks[i]();
      if (i < tasks.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    Logger.log(' Completed rate-limited sync for all tasks.');
  }

  public async getProductIds(): Promise<number[]> {
    const products = await this.prisma.product.findMany({ select: { id: true } });
    return products.map((p) => p.id);
  }

  //  Every 15 minutes — fetch for today
  @Cron('*/15 * * * *')
  async fetchToday() {
    Logger.log('⏱️ Running 15-minute sync (today only)');
    const productIds = await this.getProductIds();
    await this.rateLimitedFetch(productIds, 1);
  }

  //  Every 4 hours — next 7 days
  @Cron('0 */4 * * *')
  async fetchNext7Days() {
    Logger.log('⏱️ Running 4-hour sync (next 7 days)');
    const productIds = await this.getProductIds();
    await this.rateLimitedFetch(productIds, 7);
  }

  //  Daily — next 30 days
  @Cron('0 0 * * *')
  async fetchNext30Days() {
    Logger.log('⏱️ Running daily sync (next 30 days)');
    const productIds = await this.getProductIds();
    await this.rateLimitedFetch(productIds, 30);
  }
}
