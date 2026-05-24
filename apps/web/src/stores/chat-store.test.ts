import { mockChatConversation, mockChatMessage } from '../testing/fixtures';
import { createIdleSlice, sliceSuccess } from './lib/async-slice';
import {
  CHAT_MESSAGE_PAGE_SIZE,
  chatUnreadTotal,
  useChatStore,
} from './chat-store';

const mockGraphql = jest.fn();

jest.mock('../lib/graphql-client', () => ({
  graphqlRequest: (...args: unknown[]) => mockGraphql(...args),
}));

const conversation = mockChatConversation({
  id: 'c1',
  title: 'Peer',
  lastMessage: 'Hi',
  lastMessageAt: '2026-05-20T10:00:00.000Z',
  unreadCount: 2,
  updatedAt: '2026-05-20T10:00:00.000Z',
});

const message = mockChatMessage({
  id: 'm1',
  body: 'Hello',
  createdAt: '2026-05-20T11:00:00.000Z',
  isMine: false,
  senderId: 'u2',
});

describe('chat-store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useChatStore.setState({
      inbox: createIdleSlice(),
      contacts: createIdleSlice(),
      messages: createIdleSlice(),
      activeConversationId: null,
      hasMoreOlder: false,
      loadingOlder: false,
    });
  });

  it('exports message page size', () => {
    expect(CHAT_MESSAGE_PAGE_SIZE).toBe(50);
  });

  it('fetchInbox loads conversations', async () => {
    mockGraphql.mockResolvedValue({ chatInbox: [conversation] });
    await useChatStore.getState().fetchInbox(true);
    expect(useChatStore.getState().inbox.status).toBe('success');
    expect(useChatStore.getState().inbox.data).toEqual([conversation]);
  });

  it('fetchInbox skips warm cache', async () => {
    useChatStore.setState({
      inbox: sliceSuccess(createIdleSlice(), [conversation]),
    });
    await useChatStore.getState().fetchInbox(false);
    expect(mockGraphql).not.toHaveBeenCalled();
  });

  it('fetchContacts loads users', async () => {
    mockGraphql.mockResolvedValue({
      chatContacts: [{ id: 'u2', displayName: 'Peer' }],
    });
    await useChatStore.getState().fetchContacts(true);
    expect(useChatStore.getState().contacts.status).toBe('success');
  });

  it('fetchMessages loads batch and sets hasMoreOlder', async () => {
    const batch = Array.from({ length: CHAT_MESSAGE_PAGE_SIZE }, (_, i) => ({
      ...message,
      id: `m${i}`,
    }));
    mockGraphql.mockResolvedValue({ chatMessages: batch });
    await useChatStore.getState().fetchMessages('c1', true);
    expect(useChatStore.getState().messages.status).toBe('success');
    expect(useChatStore.getState().activeConversationId).toBe('c1');
    expect(useChatStore.getState().hasMoreOlder).toBe(true);
  });

  it('fetchOlderMessages prepends unique rows', async () => {
    useChatStore.setState({
      activeConversationId: 'c1',
      hasMoreOlder: true,
      loadingOlder: false,
      messages: sliceSuccess(createIdleSlice(), [message]),
    });
    mockGraphql.mockResolvedValue({
      chatMessages: [
        { ...message, id: 'm0', createdAt: '2026-05-20T09:00:00.000Z' },
      ],
    });
    await useChatStore.getState().fetchOlderMessages('c1');
    expect(useChatStore.getState().messages.data).toHaveLength(2);
    expect(useChatStore.getState().loadingOlder).toBe(false);
  });

  it('setActiveConversation clears pagination when null', () => {
    useChatStore.setState({ hasMoreOlder: true, loadingOlder: true });
    useChatStore.getState().setActiveConversation(null);
    expect(useChatStore.getState().activeConversationId).toBeNull();
    expect(useChatStore.getState().hasMoreOlder).toBe(false);
    expect(useChatStore.getState().loadingOlder).toBe(false);
  });

  it('openDirect patches inbox', async () => {
    mockGraphql.mockResolvedValue({
      findOrCreateDirectConversation: conversation,
    });
    const result = await useChatStore.getState().openDirect('u2');
    expect(result).toEqual(conversation);
    expect(useChatStore.getState().inbox.data?.[0]?.id).toBe('c1');
  });

  it('createGroup patches inbox', async () => {
    const group = {
      ...conversation,
      id: 'g1',
      type: 'group' as const,
      title: 'Team',
    };
    mockGraphql.mockResolvedValue({ createGroupConversation: group });
    const result = await useChatStore.getState().createGroup('Team', ['u2']);
    expect(result.title).toBe('Team');
    expect(useChatStore.getState().inbox.data?.[0]?.id).toBe('g1');
  });

  it('markRead zeroes unread count locally', async () => {
    useChatStore.setState({
      inbox: sliceSuccess(createIdleSlice(), [
        { ...conversation, unreadCount: 3 },
      ]),
    });
    mockGraphql.mockResolvedValue({});
    await useChatStore.getState().markRead('c1');
    expect(useChatStore.getState().inbox.data?.[0]?.unreadCount).toBe(0);
  });

  it('appendMessage updates messages and inbox', () => {
    useChatStore.setState({
      activeConversationId: 'c1',
      messages: sliceSuccess(createIdleSlice(), []),
      inbox: sliceSuccess(createIdleSlice(), [
        { ...conversation, unreadCount: 0 },
      ]),
    });
    useChatStore.getState().appendMessage(message);
    expect(useChatStore.getState().messages.data).toHaveLength(1);
    expect(useChatStore.getState().inbox.data?.[0]?.lastMessage).toBe('Hello');
    expect(useChatStore.getState().inbox.data?.[0]?.unreadCount).toBe(1);
  });

  it('appendMessage skips duplicate ids', () => {
    useChatStore.setState({
      activeConversationId: 'c1',
      messages: sliceSuccess(createIdleSlice(), [message]),
      inbox: createIdleSlice(),
    });
    useChatStore.getState().appendMessage(message);
    expect(useChatStore.getState().messages.data).toHaveLength(1);
  });

  it('patchInboxConversation sorts by lastMessageAt', () => {
    useChatStore.setState({
      inbox: sliceSuccess(createIdleSlice(), [
        {
          ...conversation,
          id: 'c-old',
          lastMessageAt: '2026-05-19T10:00:00.000Z',
        },
      ]),
    });
    useChatStore.getState().patchInboxConversation({
      ...conversation,
      id: 'c-new',
      lastMessageAt: '2026-05-21T10:00:00.000Z',
    });
    expect(useChatStore.getState().inbox.data?.[0]?.id).toBe('c-new');
  });

  it('chatUnreadTotal sums unreadCount', () => {
    expect(
      chatUnreadTotal([
        { unreadCount: 2 } as never,
        { unreadCount: 3 } as never,
      ]),
    ).toBe(5);
    expect(chatUnreadTotal(undefined)).toBe(0);
  });
});
