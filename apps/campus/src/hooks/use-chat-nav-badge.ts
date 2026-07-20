'use client';

import { useEffect } from 'react';
import { useAuth } from '../lib/auth-context';
import { chatUnreadTotal, useChatStore } from '../stores/chat-store';

/** Sidebar Chat badge — total unread messages across conversations. */
export function useChatNavBadge(): number {
  const { user } = useAuth();
  const inbox = useChatStore((s) => s.inbox);
  const fetchInbox = useChatStore((s) => s.fetchInbox);

  useEffect(() => {
    if (!user?.id) return;
    void fetchInbox();
  }, [user?.id, fetchInbox]);

  return chatUnreadTotal(inbox.data ?? undefined);
}
