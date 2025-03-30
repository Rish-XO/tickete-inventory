import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { InventoryModule } from '../inventory/inventory.module';
import { PrismaModule } from 'prisma/prisma.module';
import { SchedulerController } from './scheduler.controller';

@Module({
  imports: [InventoryModule, PrismaModule],
  providers: [SchedulerService],
  controllers: [SchedulerController],
})
export class SchedulerModule {}
