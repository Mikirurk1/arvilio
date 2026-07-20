'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { MessageSquarePlus, Users } from 'lucide-react';
import { useBreakpoint } from '../../hooks/use-breakpoint';
import { isAdminOrSuperKey, useActiveRoleKey } from '../../lib/active-user';
import { useChatSocket } from '../../hooks/use-chat-socket';
import { useChatStore } from '../../stores/chat-store';
import { Button } from '../../components/ui';
import { ChatInbox } from './ChatInbox';
import { ChatThread } from './ChatThread';
import { CreateGroupModal } from './CreateGroupModal';
import { NewDirectModal } from './NewDirectModal';
import { useCampusT } from '../../lib/cms';
import styles from './page.module.scss';

export default function ChatPage() {
  const t = useCampusT();
  const searchParams = useSearchParams();
  const peerFromUrl = searchParams.get('peer');
  const openedPeerRef = useRef<string | null>(null);
  const { isMobile } = useBreakpoint();
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

  const handleSelect = useCallback(
    (conversationId: string) => {
      setActiveConversation(conversationId);
      void fetchMessages(conversationId, true);
      void markRead(conversationId);
    },
    [fetchMessages, markRead, setActiveConversation],
  );

  useEffect(() => {
    if (!peerFromUrl || openedPeerRef.current === peerFromUrl) return;
    openedPeerRef.current = peerFromUrl;
    void (async () => {
      try {
        const conversation = await openDirect(peerFromUrl);
        handleSelect(conversation.id);
      } catch {
        openedPeerRef.current = null;
      }
    })();
  }, [peerFromUrl, openDirect, handleSelect]);

  const handleBack = () => {
    setActiveConversation(null);
  };

  const showInbox = !isMobile || !activeConversationId;
  const showThread = !isMobile || Boolean(activeConversationId);

  const handleOpenDirect = async (peerUserId: string) => {
    const conversation = await openDirect(peerUserId);
    setShowNewDirect(false);
    handleSelect(conversation.id);
  };

  const headerExtra = (
    <div className={styles.inboxActions}>
      <Button
        type="button"
        variant="ghost"
        className={styles.iconBtn}
        aria-label={t('chat.newMessageAria')}
        data-tour-anchor="chat-new-message"
        onClick={() => setShowNewDirect(true)}
      >
        <MessageSquarePlus size={16} />
      </Button>
      {canManageGroups ? (
        <Button
          type="button"
          variant="ghost"
          className={styles.iconBtn}
          aria-label={t('chat.createGroupAria')}
          data-tour-anchor="chat-create-group"
          onClick={() => setShowCreateGroup(true)}
        >
          <Users size={16} />
        </Button>
      ) : null}
    </div>
  );

  return (
    <div className={styles.page}>
      {showInbox ? (
        <ChatInbox
          conversations={conversations}
          activeId={activeConversationId}
          onSelect={handleSelect}
          headerExtra={headerExtra}
        />
      ) : null}
      {showThread ? (
        <ChatThread
          conversation={activeConversation}
          messages={messages.data ?? []}
          loading={messages.status === 'loading' || messages.status === 'idle'}
          onBack={isMobile && activeConversationId ? handleBack : undefined}
        />
      ) : null}
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
