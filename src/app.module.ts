import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InventoryModule } from './inventory/inventory.module';
import { SchedulerModule } from './scheduler/scheduler.module';

@Module({
  imports: [InventoryModule, SchedulerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
