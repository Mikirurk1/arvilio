'use client';

import { useEffect, useMemo, useState } from 'react';
import { MessageSquarePlus, Users } from 'lucide-react';
import { canView } from '../../mocks';
import { mapAuthRoleToRoleId } from '../../lib/active-user';
import { isAdminOrSuperKey, useActiveRoleKey } from '../../lib/active-user';
import { useAuth } from '../../lib/auth-context';
import { useChatSocket } from '../../hooks/use-chat-socket';
import { chatUnreadTotal, useChatStore } from '../../stores/chat-store';
import { Button } from '../../components/ui';
import { ChatInbox } from './ChatInbox';
import { ChatThread } from './ChatThread';
import { CreateGroupModal } from './CreateGroupModal';
import { NewDirectModal } from './NewDirectModal';
import styles from './page.module.scss';

export default function ChatPage() {
  const { user } = useAuth();
  const roleId = mapAuthRoleToRoleId(user?.role);
  const roleKey = useActiveRoleKey();
  const canManageGroups = isAdminOrSuperKey(roleKey);

  const inbox = useChatStore((s) => s.inbox);
  const contacts = useChatStore((s) => s.contacts);
  const messages = useChatStore((s) => s.messages);
  const activeConversationId = useChatStore((s) => s.activeConversationId);
  const fetchInbox = useChatStore((s) => s.fetchInbox);
  const fetchContacts = useChatStore((s) => s.fetchContacts);
  const fetchMessages = useChatStore((s) => s.fetchMessages);
  const setActiveConversation = useChatStore((s) => s.setActiveConversation);
  const openDirect = useChatStore((s) => s.openDirect);
  const createGroup = useChatStore((s) => s.createGroup);
  const markRead = useChatStore((s) => s.markRead);

  const [showNewDirect, setShowNewDirect] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  useChatSocket(activeConversationId);

  useEffect(() => {
    void fetchInbox();
    void fetchContacts();
  }, [fetchInbox, fetchContacts]);

  const conversations = inbox.data ?? [];
  const activeConversation = useMemo(
    () => conversations.find((row) => row.id === activeConversationId) ?? null,
    [conversations, activeConversationId],
  );

  const handleSelect = (conversationId: string) => {
    setActiveConversation(conversationId);
    void fetchMessages(conversationId, true);
    void markRead(conversationId);
  };

  const handleOpenDirect = async (peerUserId: string) => {
    const conversation = await openDirect(peerUserId);
    setShowNewDirect(false);
    handleSelect(conversation.id);
  };

  if (!canView('chat', roleId)) return null;

  const headerExtra = (
    <div style={{ display: 'flex', gap: 6 }}>
      <Button
        type="button"
        variant="ghost"
        className={styles.iconBtn}
        aria-label="New message"
        onClick={() => setShowNewDirect(true)}
      >
        <MessageSquarePlus size={16} />
      </Button>
      {canManageGroups ? (
        <Button
          type="button"
          variant="ghost"
          className={styles.iconBtn}
          aria-label="Create group"
          onClick={() => setShowCreateGroup(true)}
        >
          <Users size={16} />
        </Button>
      ) : null}
    </div>
  );

  return (
    <div className={styles.page}>
      <ChatInbox
        conversations={conversations}
        activeId={activeConversationId}
        onSelect={handleSelect}
        headerExtra={headerExtra}
      />
      <ChatThread
        conversation={activeConversation}
        messages={messages.data ?? []}
        loading={messages.status === 'loading' || messages.status === 'idle'}
      />
      {showNewDirect ? (
        <NewDirectModal
          contacts={contacts.data ?? []}
          onClose={() => setShowNewDirect(false)}
          onSelect={handleOpenDirect}
        />
      ) : null}
      {showCreateGroup ? (
        <CreateGroupModal
          contacts={contacts.data ?? []}
          onClose={() => setShowCreateGroup(false)}
          onCreate={async (title, memberIds) => {
            const conversation = await createGroup(title, memberIds);
            handleSelect(conversation.id);
          }}
        />
      ) : null}
    </div>
  );
}
