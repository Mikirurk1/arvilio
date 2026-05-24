import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard, CurrentUser } from '@be/auth';
import type {
  CreateStudentWordCardRequestDto,
  CreateWordRequestDto,
  StudentWordCardDto,
  VocabularyOverviewDto,
  WordCardDto,
  WordDetailsDto,
  WordLookupResultDto,
} from '@pkg/types';
import { VocabularyService } from '../../application/vocabulary.service';

@Controller('vocabulary')
@UseGuards(AuthGuard)
export class VocabularyController {
  constructor(private readonly vocabulary: VocabularyService) {}

  @Get('overview')
  async overview(@CurrentUser() userId: string): Promise<VocabularyOverviewDto> {
    return this.vocabulary.overviewFor(userId);
  }

  @Get('words')
  async words(
    @Query('search') search: string | undefined,
    @Query('category') category: string | undefined,
    @Query('take') take: string | undefined,
  ): Promise<WordCardDto[]> {
    return this.vocabulary.listWords({
      search,
      category,
      take: take ? Number(take) : undefined,
    });
  }

  @Get('words/lookup')
  async lookupWord(@Query('text') text: string | undefined): Promise<WordLookupResultDto> {
    if (!text?.trim()) throw new BadRequestException('text query is required');
    return this.vocabulary.lookupWord(text);
  }

  @Get('words/:id/details')
  async wordDetails(@Param('id') id: string): Promise<WordDetailsDto> {
    return this.vocabulary.getWordDetails(id);
  }

  @Post('words')
  async createWord(@Body() body: CreateWordRequestDto): Promise<WordCardDto> {
    return this.vocabulary.findOrCreateWord(body);
  }

  @Get('cards')
  async myCards(@CurrentUser() userId: string): Promise<StudentWordCardDto[]> {
    return this.vocabulary.listStudentCards(userId);
  }

  @Post('cards')
  async addCard(
    @CurrentUser() userId: string,
    @Body() body: CreateStudentWordCardRequestDto,
  ): Promise<StudentWordCardDto> {
    return this.vocabulary.createStudentCard(userId, userId, body);
  }

  @Patch('cards/:id/status')
  async updateCardStatus(
    @CurrentUser() userId: string,
    @Param('id') id: string,
    @Body() body: { status: StudentWordCardDto['status'] },
  ): Promise<StudentWordCardDto> {
    if (!body?.status) throw new BadRequestException('status is required');
    return this.vocabulary.statusUpdate(userId, id, body.status, userId);
  }
}

