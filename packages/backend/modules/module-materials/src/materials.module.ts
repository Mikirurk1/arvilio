import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from '@be/prisma';
import { VocabularyModule } from '@be/vocabulary';
import { MaterialsAccessService } from './application/materials-access.service';
import { MaterialAttachmentService } from './application/material-attachment.service';
import { MaterialFileCompressorService } from './application/material-file-compressor.service';
import { MaterialsService } from './application/materials.service';
import { MaterialsResolver } from './presentation/graphql/materials.resolver';
import { MaterialFilesController } from './presentation/rest/material-files.controller';
import { MaterialAnnotationsController } from './presentation/rest/material-annotations.controller';
import { LibraryFileAnnotationsService } from './application/library-file-annotations.service';
import { LibraryFileCaptionService } from './application/library-file-caption.service';

@Module({
  imports: [PrismaModule, forwardRef(() => VocabularyModule)],
  controllers: [MaterialFilesController, MaterialAnnotationsController],
  providers: [
    MaterialsAccessService,
    MaterialFileCompressorService,
    MaterialAttachmentService,
    MaterialsService,
    MaterialsResolver,
    LibraryFileAnnotationsService,
    LibraryFileCaptionService,
  ],
  exports: [MaterialsService, MaterialAttachmentService, MaterialsResolver],
})
export class MaterialsModule {}
