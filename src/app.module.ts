import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InventoryModule } from './inventory/inventory.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { PrismaModule } from 'prisma/prisma.module';

@Module({
  imports: [InventoryModule, SchedulerModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
