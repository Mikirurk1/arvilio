import { Args, ID, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CurrentGqlUser, GqlAuthGuard } from '@be/auth';
import { ChatService } from '../../application/chat.service';
import { ChatVisibilityService } from '../../application/chat-visibility.service';
import {
  ChatConversationType,
  ChatInboxPageType,
  ChatMessageType,
  ChatUserType,
  CreateGroupConversationInput,
  OkResultType,
} from '@be/graphql';

@Resolver()
@UseGuards(GqlAuthGuard)
export class ChatResolver {
  constructor(
    private readonly chat: ChatService,
    private readonly visibility: ChatVisibilityService,
  ) {}

  @Query(() => [ChatUserType], { name: 'chatContacts' })
  chatContacts(@CurrentGqlUser() userId: string) {
    return this.visibility.listContacts(userId);
  }

  @Query(() => [ChatConversationType], { name: 'chatInbox' })
  chatInbox(@CurrentGqlUser() userId: string) {
    return this.chat.inbox(userId);
  }

  @Query(() => ChatInboxPageType, { name: 'chatInboxPage' })
  chatInboxPage(
    @CurrentGqlUser() userId: string,
    @Args('cursor', { nullable: true }) cursor?: string,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ) {
    return this.chat.inboxPage(userId, limit ?? 25, cursor);
  }

  @Query(() => [ChatMessageType], { name: 'chatMessages' })
  chatMessages(
    @CurrentGqlUser() userId: string,
    @Args('conversationId', { type: () => ID }) conversationId: string,
    @Args('cursor', { nullable: true }) cursor?: string,
  ) {
    return this.chat.messages(userId, conversationId, cursor);
  }

  @Mutation(() => ChatConversationType, { name: 'findOrCreateDirectConversation' })
  findOrCreateDirectConversation(
    @CurrentGqlUser() userId: string,
    @Args('peerUserId', { type: () => ID }) peerUserId: string,
  ) {
    return this.chat.findOrCreateDirect(userId, peerUserId);
  }

  @Mutation(() => ChatConversationType, { name: 'createGroupConversation' })
  createGroupConversation(
    @CurrentGqlUser() userId: string,
    @Args('input') input: CreateGroupConversationInput,
  ) {
    return this.chat.createGroup(userId, input.title, input.memberIds ?? []);
  }

  @Mutation(() => OkResultType, { name: 'markConversationRead' })
  async markConversationRead(
    @CurrentGqlUser() userId: string,
    @Args('conversationId', { type: () => ID }) conversationId: string,
  ) {
    await this.chat.markRead(userId, conversationId);
    return { ok: true };
  }
}
