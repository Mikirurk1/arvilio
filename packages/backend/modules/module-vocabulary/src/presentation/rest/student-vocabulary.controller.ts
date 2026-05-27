import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard, CurrentUser } from '@be/auth';
import type { CreateStudentWordCardRequestDto, StudentWordCardDto } from '@pkg/types';
import { VocabularyService } from '../../application/vocabulary.service';

@Controller('students')
@UseGuards(AuthGuard)
export class StudentVocabularyController {
  constructor(private readonly vocabulary: VocabularyService) {}

  @Get(':studentId/vocabulary')
  async listStudentCards(
    @CurrentUser() actorId: string,
    @Param('studentId') studentId: string,
  ): Promise<StudentWordCardDto[]> {
    return this.vocabulary.listStudentCards(studentId, actorId);
  }

  @Post(':studentId/vocabulary')
  async addStudentCard(
    @CurrentUser() actorId: string,
    @Param('studentId') studentId: string,
    @Body() body: CreateStudentWordCardRequestDto,
  ): Promise<StudentWordCardDto> {
    return this.vocabulary.createStudentCard(studentId, actorId, body);
  }

  @Patch(':studentId/vocabulary/:cardId/status')
  async updateStudentCard(
    @CurrentUser() actorId: string,
    @Param('studentId') studentId: string,
    @Param('cardId') cardId: string,
    @Body() body: { status: StudentWordCardDto['status'] },
  ): Promise<StudentWordCardDto> {
    if (!body?.status) throw new BadRequestException('status is required');
    return this.vocabulary.statusUpdate(studentId, cardId, body.status, actorId);
  }
}
