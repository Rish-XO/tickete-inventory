import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InventoryModule } from './inventory/inventory.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { PrismaModule } from 'prisma/prisma.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [InventoryModule,ScheduleModule.forRoot(), SchedulerModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
