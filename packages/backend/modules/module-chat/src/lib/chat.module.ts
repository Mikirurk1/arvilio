import { Module } from '@nestjs/common';
import { AuthModule } from '@soenglish/module-auth';
import { PrismaModule } from '@soenglish/data-access-prisma';
import { ChatAttachmentService } from './chat-attachment.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ChatVisibilityService } from './chat-visibility.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ChatController],
  providers: [ChatVisibilityService, ChatAttachmentService, ChatService, ChatGateway],
  exports: [ChatService, ChatVisibilityService, ChatGateway],
})
export class ChatModule {}
