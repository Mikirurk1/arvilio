import { Module } from '@nestjs/common';
import { AuthModule } from '@be/auth';
import { PrismaModule } from '@be/prisma';
import { ChatAttachmentService } from './application/chat-attachment.service';
import { ChatService } from './application/chat.service';
import { ChatVisibilityService } from './application/chat-visibility.service';
import { ChatResolver } from './presentation/graphql/chat.resolver';
import { ChatGateway } from './presentation/chat.gateway';
import { ChatController } from './presentation/rest/chat.controller';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ChatController],
  providers: [
    ChatVisibilityService,
    ChatAttachmentService,
    ChatService,
    ChatGateway,
    ChatResolver,
  ],
  exports: [ChatService, ChatVisibilityService, ChatGateway, ChatResolver],
})
export class ChatModule {}
