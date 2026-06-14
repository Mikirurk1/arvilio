import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard, CurrentUser } from '@be/auth';
import type { SaveLibraryFileAnnotationRequestDto } from '@pkg/types';
import { LibraryFileAnnotationsService } from '../../application/library-file-annotations.service';

@Controller('materials/annotations')
@UseGuards(AuthGuard)
export class MaterialAnnotationsController {
  constructor(private readonly annotations: LibraryFileAnnotationsService) {}

  @Get(':fileAttachmentId')
  get(
    @CurrentUser() userId: string,
    @Param('fileAttachmentId') fileAttachmentId: string,
    @Query('subjectUserId') subjectUserId?: string,
  ) {
    return this.annotations.get(userId, fileAttachmentId, subjectUserId);
  }

  @Put(':fileAttachmentId')
  upsert(
    @CurrentUser() userId: string,
    @Param('fileAttachmentId') fileAttachmentId: string,
    @Body() body: SaveLibraryFileAnnotationRequestDto,
  ) {
    return this.annotations.upsert(userId, fileAttachmentId, body);
  }

  @Delete(':fileAttachmentId')
  clearOverlay(
    @CurrentUser() userId: string,
    @Param('fileAttachmentId') fileAttachmentId: string,
    @Query('contextUserId') contextUserId: string,
  ) {
    return this.annotations.clearOverlay(userId, fileAttachmentId, contextUserId);
  }
}
