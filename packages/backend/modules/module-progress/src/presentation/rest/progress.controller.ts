import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard, CurrentUser } from '@be/auth';
import type { CalendarEventDto } from '@pkg/types';
import { CalendarEventsService } from '../../application/calendar-events.service';

@Controller('calendar')
@UseGuards(AuthGuard)
export class ProgressController {
  constructor(private readonly calendarEvents: CalendarEventsService) {}

  @Get('events')
  getCalendarEvents(@CurrentUser() userId: string): Promise<CalendarEventDto[]> {
    return this.calendarEvents.listForUser(userId);
  }
}
