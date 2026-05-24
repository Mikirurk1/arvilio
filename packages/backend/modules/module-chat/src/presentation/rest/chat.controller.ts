import {
  Body,
  Controller,
  Get,
  GoneException,
  Param,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard, CurrentUser } from '@be/auth';
import type { ChatMessageDto } from '@pkg/types';
import type { Response } from 'express';
import { memoryStorage } from 'multer';

type UploadedChatFile = {
  buffer: Buffer;
  mimetype: string;
  size: number;
  originalname: string;
};
import { CHAT_ATTACHMENT_MAX_BYTES } from '../../shared/chat-attachment.constants';
import { ChatAttachmentService } from '../../application/chat-attachment.service';
import { ChatGateway } from '../chat.gateway';
import { ChatService } from '../../application/chat.service';

@Controller('chat')
@UseGuards(AuthGuard)
export class ChatController {
  constructor(
    private readonly chat: ChatService,
    private readonly attachments: ChatAttachmentService,
    private readonly gateway: ChatGateway,
  ) {}

  @Post('conversations/:conversationId/attachments')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: CHAT_ATTACHMENT_MAX_BYTES },
    }),
  )
  async uploadAttachment(
    @CurrentUser() userId: string,
    @Param('conversationId') conversationId: string,
    @UploadedFile() file: UploadedChatFile,
    @Body('body') body?: string,
  ): Promise<ChatMessageDto> {
    const message = await this.chat.sendMessageWithAttachment(
      userId,
      conversationId,
      file,
      typeof body === 'string' ? body : '',
    );
    this.gateway.broadcastNewMessage(message, conversationId);
    return message;
  }

  @Get('attachments/:attachmentId')
  async downloadAttachment(
    @CurrentUser() userId: string,
    @Param('attachmentId') attachmentId: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const meta = await this.chat.resolveAttachmentDownload(userId, attachmentId);
      const file = await this.attachments.assertDownloadable(attachmentId);
      const stream = await this.attachments.openReadStream(file.storageKey);
      res.setHeader('Content-Type', meta.mimeType);
      res.setHeader(
        'Content-Disposition',
        `inline; filename="${encodeURIComponent(meta.fileName)}"`,
      );
      stream.pipe(res);
    } catch (error) {
      if (error instanceof GoneException) {
        res.status(410).json({ message: error.message });
        return;
      }
      throw error;
    }
  }
}
