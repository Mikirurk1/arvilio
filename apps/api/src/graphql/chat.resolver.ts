import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CurrentGqlUser, GqlAuthGuard } from '@soenglish/module-auth';
import { ChatService, ChatVisibilityService } from '@soenglish/module-chat';
import {
  ChatConversationType,
  ChatMessageType,
  ChatUserType,
  CreateGroupConversationInput,
  OkResultType,
} from './graphql.types';

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
