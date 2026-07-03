import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard, CurrentUser, FeatureGuard, RequiresFeature } from '@be/auth';
import type {
  CreateScheduledLessonRequestDto,
  ScheduledLessonBackendDto,
  UpdateScheduledLessonRequestDto,
} from '@pkg/types';
import { LessonsService } from '../../application/lessons.service';

@Controller('lessons/scheduled')
@UseGuards(AuthGuard)
export class ScheduledLessonsController {
  constructor(private readonly lessons: LessonsService) {}

  @Get()
  async list(@CurrentUser() userId: string): Promise<ScheduledLessonBackendDto[]> {
    return this.lessons.listFor(userId);
  }

  @Get(':id')
  async get(
    @CurrentUser() userId: string,
    @Param('id') id: string,
  ): Promise<ScheduledLessonBackendDto> {
    const lesson = await this.lessons.fetchLesson(id);
    if (!lesson) throw new NotFoundException('Lesson not found');
    if (lesson.teacherId !== userId && lesson.studentId !== userId)
      throw new ForbiddenException();
    return this.lessons.toDto(lesson);
  }

  @Post()
  async create(
    @CurrentUser() userId: string,
    @Body() body: CreateScheduledLessonRequestDto,
  ): Promise<ScheduledLessonBackendDto> {
    return this.lessons.create(userId, body);
  }

  /** Static path — avoids `:id/meet` routing issues; prefer this over nested segment routes. */
  @Post('meet')
  async ensureMeetByBody(
    @CurrentUser() userId: string,
    @Body() body: { lessonId: string },
  ): Promise<ScheduledLessonBackendDto> {
    if (!body?.lessonId?.trim()) {
      throw new BadRequestException('lessonId is required');
    }
    return this.lessons.ensureMeetLink(body.lessonId.trim(), userId);
  }

  @Post(':id/meet')
  async ensureMeet(
    @CurrentUser() userId: string,
    @Param('id') id: string,
  ): Promise<ScheduledLessonBackendDto> {
    return this.lessons.ensureMeetLink(id, userId);
  }

  @Get(':id/livekit-token')
  @UseGuards(FeatureGuard)
  @RequiresFeature('recordings')
  async livekitToken(
    @CurrentUser() userId: string,
    @Param('id') id: string,
  ): Promise<{ wsUrl: string; token: string; roomName: string }> {
    return this.lessons.issueLiveKitToken(id, userId);
  }

  @Patch(':id')
  async update(
    @CurrentUser() userId: string,
    @Param('id') id: string,
    @Body() body: UpdateScheduledLessonRequestDto,
  ): Promise<ScheduledLessonBackendDto> {
    return this.lessons.update(id, userId, body);
  }

  @Delete(':id')
  async remove(@CurrentUser() userId: string, @Param('id') id: string): Promise<{ ok: true }> {
    await this.lessons.remove(id, userId);
    return { ok: true };
  }
}
