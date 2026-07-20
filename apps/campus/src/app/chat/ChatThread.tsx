'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, MessagesSquare, Paperclip, Send, Smile } from 'lucide-react';
import type { ChatConversationDto, ChatMessageDto } from '@pkg/types';
import { Button, Field, UserAvatar } from '../../components/ui';
import { confirmDialog } from '../../features/confirm';
import { filterSafeFiles } from '../../features/lesson-modal/fileUtils';
import { getChatSocket } from '../../lib/chat-socket';
import { uploadChatAttachment } from '../../lib/chat-upload';
import { toast } from '../../features/notifications';
import { useChatStore } from '../../stores/chat-store';
import { useCampusI18n, useCampusT } from '../../lib/cms';
import { ChatEmojiPicker } from './ChatEmojiPicker';
import { ChatMessageContent } from './ChatMessageContent';
import styles from './page.module.scss';

const SCROLL_NEAR_BOTTOM_PX = 120;

function formatMessageTime(iso: string, locale: string): string {
  return new Date(iso).toLocaleTimeString(locale === 'uk' ? 'uk-UA' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function isNearBottom(el: HTMLElement, threshold = SCROLL_NEAR_BOTTOM_PX): boolean {
  return el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
}

export function ChatThread({
  conversation,
  messages,
  loading,
  onBack,
}: {
  conversation: ChatConversationDto | null;
  messages: ChatMessageDto[];
  loading: boolean;
  onBack?: () => void;
}) {
  const t = useCampusT();
  const { locale } = useCampusI18n();
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const topSentinelRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const stickToBottomRef = useRef(true);
  const isPrependingOlderRef = useRef(false);
  const prevConversationIdRef = useRef<string | null>(null);
  const prevLoadingRef = useRef(true);
  const prevMessageCountRef = useRef(0);

  const appendMessage = useChatStore((s) => s.appendMessage);
  const hasMoreOlder = useChatStore((s) => s.hasMoreOlder);
  const loadingOlder = useChatStore((s) => s.loadingOlder);
  const fetchOlderMessages = useChatStore((s) => s.fetchOlderMessages);

  const attachConfirm = {
    title: t('chat.attach.confirmTitle'),
    message: t('chat.attach.confirmBody'),
    confirmLabel: t('chat.attach.confirmLabel'),
  };

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    bottomRef.current?.scrollIntoView({ behavior });
  }, []);

  const loadOlderMessages = useCallback(async () => {
    if (!conversation || loadingOlder || !hasMoreOlder || loading) return;
    const el = scrollContainerRef.current;
    if (!el) return;

    const prevHeight = el.scrollHeight;
    const prevTop = el.scrollTop;
    isPrependingOlderRef.current = true;
    try {
      await fetchOlderMessages(conversation.id);
      requestAnimationFrame(() => {
        if (scrollContainerRef.current) {
          const next = scrollContainerRef.current;
          next.scrollTop = prevTop + (next.scrollHeight - prevHeight);
        }
        isPrependingOlderRef.current = false;
      });
    } catch {
      isPrependingOlderRef.current = false;
    }
  }, [conversation, fetchOlderMessages, hasMoreOlder, loading, loadingOlder]);

  const handleMessagesScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (el) stickToBottomRef.current = isNearBottom(el);
  }, []);

  useEffect(() => {
    const root = scrollContainerRef.current;
    const sentinel = topSentinelRef.current;
    if (!root || !sentinel || !conversation || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadOlderMessages();
        }
      },
      { root, rootMargin: '80px' },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [conversation?.id, loading, loadOlderMessages]);

  useEffect(() => {
    if (!conversation) return;

    const convChanged = prevConversationIdRef.current !== conversation.id;
    if (convChanged) {
      prevConversationIdRef.current = conversation.id;
      stickToBottomRef.current = true;
      prevMessageCountRef.current = 0;
    }

    if (loading) {
      prevLoadingRef.current = true;
      return;
    }

    const justFinishedLoading = prevLoadingRef.current;
    prevLoadingRef.current = false;

    if (isPrependingOlderRef.current) {
      prevMessageCountRef.current = messages.length;
      return;
    }

    if (convChanged || justFinishedLoading) {
      requestAnimationFrame(() => scrollToBottom('auto'));
      prevMessageCountRef.current = messages.length;
      return;
    }

    if (messages.length <= prevMessageCountRef.current) {
      prevMessageCountRef.current = messages.length;
      return;
    }

    prevMessageCountRef.current = messages.length;
    if (stickToBottomRef.current) {
      scrollToBottom('smooth');
    }
  }, [conversation, loading, messages, scrollToBottom]);

  if (!conversation) {
    return (
      <section className={styles.thread} aria-label={t('chat.conversationAria')}>
        <div className={styles.threadEmpty}>
          <span className={styles.threadEmptyIcon} aria-hidden>
            <MessagesSquare size={26} />
          </span>
          <p className={styles.threadEmptyTitle}>{t('chat.empty.title')}</p>
          <p className={styles.threadEmptyHint}>{t('chat.empty.hint')}</p>
        </div>
      </section>
    );
  }

  const subtitle =
    conversation.type === 'group'
      ? t('chat.members', { count: conversation.participants?.length ?? 0 })
      : (conversation.peer?.roleLabel ?? '');

  const handleSend = () => {
    const body = input.trim();
    if (!body || sending || uploading) return;
    stickToBottomRef.current = true;
    setSending(true);
    const socket = getChatSocket();
    socket.emit(
      'message:send',
      { conversationId: conversation.id, body },
      (ack: { ok?: boolean; error?: string }) => {
        setSending(false);
        if (ack?.ok) {
          setInput('');
        } else {
          toast.error(t('chat.error.sendTitle'), ack?.error ?? t('chat.error.tryAgain'));
        }
      },
    );
  };

  const handleAttachClick = async () => {
    const ok = await confirmDialog(attachConfirm);
    if (ok) fileInputRef.current?.click();
  };

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files?.length || uploading) return;
    const { safe, rejected, maxFileSizeMb } = filterSafeFiles(files);
    if (rejected.length > 0) {
      toast.error(
        t('chat.error.filesRejected'),
        t('chat.error.filesRejectedDetail', {
          max: maxFileSizeMb,
          files: rejected.join(', '),
        }),
      );
    }
    if (!safe.length) return;
    const rawFile = files[0];

    stickToBottomRef.current = true;
    setUploading(true);
    try {
      const caption = input.trim();
      const message = await uploadChatAttachment(conversation.id, rawFile, caption);
      appendMessage(message);
      setInput('');
    } catch (error) {
      toast.error(
        t('chat.error.uploadTitle'),
        error instanceof Error ? error.message : t('chat.error.tryAgain'),
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const insertEmoji = (emoji: string) => {
    setInput((prev) => prev + emoji);
  };

  const showHistoryStart = !loading && messages.length > 0 && !hasMoreOlder;

  return (
    <section className={styles.thread} aria-label={t('chat.withAria', { name: conversation.title })}>
      <header className={styles.threadHead}>
        {onBack ? (
          <Button
            type="button"
            variant="ghost"
            className={styles.backBtn}
            aria-label={t('chat.backAria')}
            onClick={onBack}
          >
            <ArrowLeft size={20} aria-hidden />
          </Button>
        ) : null}
        <div className={styles.threadPeer}>
          <UserAvatar
            size="md"
            src={conversation.type === 'direct' ? conversation.peer?.avatarUrl : null}
            name={conversation.type === 'direct' ? (conversation.peer?.displayName ?? conversation.title) : conversation.title}
            className={styles.avatar}
          />
          <div>
            <h3 className={styles.threadPeerName}>{conversation.title}</h3>
            <p className={styles.threadPeerRole}>{subtitle}</p>
          </div>
        </div>
      </header>

      <p className={styles.retentionBanner}>{t('chat.retentionBanner')}</p>

      <div
        ref={scrollContainerRef}
        className={styles.messages}
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        onScroll={handleMessagesScroll}
      >
        <div ref={topSentinelRef} className={styles.historySentinel} aria-hidden />
        {loadingOlder ? (
          <p className={styles.historyStatus}>{t('chat.loadingOlder')}</p>
        ) : null}
        {showHistoryStart ? (
          <p className={styles.historyStatus}>{t('chat.historyStart')}</p>
        ) : null}
        {loading ? <p className={styles.threadEmpty}>{t('chat.loadingMessages')}</p> : null}
        {!loading
          ? messages.map((message) => (
              <div
                key={message.id}
                className={`${styles.bubbleRow} ${message.isMine ? styles.bubbleRowMine : ''}`}
              >
                {!message.isMine ? (
                  <UserAvatar
                    size="sm"
                    src={message.sender.avatarUrl}
                    name={message.sender.displayName}
                    className={styles.avatar}
                  />
                ) : null}
                <div>
                  <div
                    className={`${styles.bubble} ${message.isMine ? styles.bubbleMine : styles.bubbleTheirs}`}
                  >
                    <ChatMessageContent message={message} />
                  </div>
                  <div
                    className={`${styles.bubbleTime} ${message.isMine ? styles.bubbleTimeMine : styles.bubbleTimeTheirs}`}
                  >
                    {formatMessageTime(message.createdAt, locale)}
                  </div>
                </div>
              </div>
            ))
          : null}
        <div ref={bottomRef} />
      </div>

      <footer className={styles.composer} data-tour-anchor="chat-composer">
        <input
          ref={fileInputRef}
          type="file"
          className={styles.hiddenFileInput}
          accept="image/*,.pdf,.txt,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
          onChange={(e) => void handleFilesSelected(e.target.files)}
        />
        <Button
          type="button"
          variant="ghost"
          className={styles.iconBtn}
          aria-label={t('chat.attach.aria')}
          disabled={uploading || sending}
          onClick={() => void handleAttachClick()}
        >
          <Paperclip size={18} />
        </Button>
        <Field
          className={styles.composerField}
          placeholder={t('chat.composer.placeholder')}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          aria-label={t('chat.composer.messageAria')}
          disabled={uploading}
        />
        <div className={styles.emojiWrap}>
          <Button
            type="button"
            variant="ghost"
            className={styles.iconBtn}
            aria-label={t('chat.emoji.insertAria')}
            aria-expanded={emojiOpen}
            onClick={() => setEmojiOpen((open) => !open)}
          >
            <Smile size={18} />
          </Button>
          <ChatEmojiPicker open={emojiOpen} onPick={insertEmoji} onClose={() => setEmojiOpen(false)} />
        </div>
        <Button
          type="button"
          variant="primary"
          className={styles.sendBtn}
          aria-label={t('chat.send.aria')}
          disabled={!input.trim() || sending || uploading}
          loading={sending}
          loadingLabel={t('chat.sending')}
          onClick={handleSend}
        >
          <Send size={18} aria-hidden />
        </Button>
      </footer>
    </section>
  );
}
