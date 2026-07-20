import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  AuthGuard,
  CurrentUser,
  FeatureGuard,
  RequiresFeature,
  Roles,
  RolesGuard,
} from '@be/auth';
import type {
  TestLlmConnectionRequestDto,
  UpdateSchoolLlmSettingsRequestDto,
} from '@pkg/types';
import { LlmSettingsService } from '../../application/llm-settings.service';

/**
 * Campus System — school LLM override (Pro / aiAssist).
 * Platform defaults live at GET/PUT /api/platform/llm.
 */
@Controller('system/llm')
@UseGuards(AuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class SchoolLlmController {
  constructor(private readonly llmSettings: LlmSettingsService) {}

  @Get()
  get() {
    return this.llmSettings.getSchoolLlmSettings(
      this.llmSettings.requireSchoolId(),
    );
  }

  @Put()
  @RequiresFeature('aiAssist')
  @UseGuards(FeatureGuard)
  put(
    @CurrentUser() _userId: string,
    @Body() body: UpdateSchoolLlmSettingsRequestDto,
  ) {
    return this.llmSettings.updateSchoolLlmSettings(
      this.llmSettings.requireSchoolId(),
      body ?? {},
    );
  }

  /** Connectivity probe with optional unsaved draft. Does not require Pro. */
  @Post('test')
  test(@Body() body: TestLlmConnectionRequestDto | undefined) {
    return this.llmSettings.testSchoolLlm(
      this.llmSettings.requireSchoolId(),
      body,
    );
  }
}
