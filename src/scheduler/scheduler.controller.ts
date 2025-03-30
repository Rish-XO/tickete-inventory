import { Controller, Post, Query } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';

@Controller('api/v1')
export class SchedulerController {
  constructor(private readonly schedulerService: SchedulerService) {}

  @Post('sync')
  async manualSync(@Query('days') daysParam: string) {
    const days = Math.min(Number(daysParam) || 1, 30); // cap at 30 days
    const productIds = await this.schedulerService['getProductIds'](); // we’ll fix this later
    return this.schedulerService.rateLimitedFetch(productIds, days);
  }
}
