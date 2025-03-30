import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { InventoryModule } from '../inventory/inventory.module';
import { PrismaModule } from 'prisma/prisma.module';

@Module({
  imports: [InventoryModule, PrismaModule],
  providers: [SchedulerService],
})
export class SchedulerModule {}
