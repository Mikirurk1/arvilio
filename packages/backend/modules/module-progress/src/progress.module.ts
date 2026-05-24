import { Module } from '@nestjs/common';
import { PrismaModule } from '@be/prisma';
import { CalendarEventsService } from './application/calendar-events.service';
import { CalendarEventsRepository } from './infrastructure/calendar-events.repository';
import { ProgressController } from './presentation/rest/progress.controller';

@Module({
  imports: [PrismaModule],
  controllers: [ProgressController],
  providers: [CalendarEventsRepository, CalendarEventsService],
})
export class ProgressModule {}
