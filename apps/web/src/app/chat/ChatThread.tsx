'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Paperclip, Send, Smile } from 'lucide-react';
import type { ChatConversationDto, ChatMessageDto } from '@soenglish/shared-types';
import { Button, Field } from '../../components/ui';
import { confirmDialog } from '../../features/confirm';
import { filterSafeFiles } from '../../features/lesson-modal/fileUtils';
import { getChatSocket } from '../../lib/chat-socket';
import { uploadChatAttachment } from '../../lib/chat-upload';
import { toast } from '../../features/notifications';
import { useChatStore } from '../../stores/chat-store';
import { ChatEmojiPicker } from './ChatEmojiPicker';
import { ChatMessageContent } from './ChatMessageContent';
import styles from './page.module.scss';

const ATTACH_CONFIRM = {
  title: 'Attach a file?',
  message:
    'Files sent in chat are automatically deleted after 24 hours. Everyone in this conversation will lose access after that.',
  confirmLabel: 'Choose file',
};

function formatMessageTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
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
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const appendMessage = useChatStore((s) => s.appendMessage);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, conversation?.id]);

  if (!conversation) {
    return (
      <section className={styles.thread}>
        <div className={styles.threadEmpty}>Select a conversation to start messaging</div>
      </section>
    );
  }

  const subtitle =
    conversation.type === 'group'
      ? `${conversation.participants?.length ?? 0} members`
      : (conversation.peer?.roleLabel ?? '');

  const handleSend = () => {
    const body = input.trim();
    if (!body || sending || uploading) return;
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
          toast.error('Could not send message', ack?.error ?? 'Try again');
        }
      },
    );
  };

  const handleAttachClick = async () => {
    const ok = await confirmDialog(ATTACH_CONFIRM);
    if (ok) fileInputRef.current?.click();
  };

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files?.length || uploading) return;
    const { safe, rejected, maxFileSizeMb } = filterSafeFiles(files);
    if (rejected.length > 0) {
      toast.error(
        'Some files were rejected',
        `Allowed types only, max ${maxFileSizeMb} MB. Rejected: ${rejected.join(', ')}`,
      );
    }
    if (!safe.length) return;
    const rawFile = files[0];

    setUploading(true);
    try {
      const caption = input.trim();
      const message = await uploadChatAttachment(conversation.id, rawFile, caption);
      appendMessage(message);
      setInput('');
    } catch (error) {
      toast.error('Could not upload file', error instanceof Error ? error.message : 'Try again');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const insertEmoji = (emoji: string) => {
    setInput((prev) => prev + emoji);
  };

  return (
    <section className={styles.thread}>
      <header className={styles.threadHead}>
        {onBack ? (
          <Button
            type="button"
            variant="ghost"
            className={styles.backBtn}
            aria-label="Back to conversations"
            onClick={onBack}
          >
            <ArrowLeft size={20} aria-hidden />
          </Button>
        ) : null}
        <div className={styles.threadPeer}>
          <span className={styles.avatar} aria-hidden>
            {conversation.type === 'group' ? 'G' : (conversation.peer?.initials ?? '?')}
          </span>
          <div>
            <h3 className={styles.threadPeerName}>{conversation.title}</h3>
            <p className={styles.threadPeerRole}>{subtitle}</p>
          </div>
        </div>
      </header>

      <p className={styles.retentionBanner}>
        Files shared in chat are deleted automatically after 24 hours.
      </p>

      <div className={styles.messages}>
        {loading ? <p className={styles.threadEmpty}>Loading messages…</p> : null}
        {!loading
          ? messages.map((message) => (
              <div
                key={message.id}
                className={`${styles.bubbleRow} ${message.isMine ? styles.bubbleRowMine : ''}`}
              >
                {!message.isMine ? (
                  <span className={styles.avatar} aria-hidden>
                    {message.sender.initials}
                  </span>
                ) : null}
                <div>
                  <div
                    className={`${styles.bubble} ${message.isMine ? styles.bubbleMine : styles.bubbleTheirs}`}
                  >
                    <ChatMessageContent message={message} />
                  </div>
                  <div className={styles.bubbleTime}>{formatMessageTime(message.createdAt)}</div>
                </div>
              </div>
            ))
          : null}
        <div ref={bottomRef} />
      </div>

      <footer className={styles.composer}>
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
          aria-label="Attach file"
          disabled={uploading || sending}
          onClick={() => void handleAttachClick()}
        >
          <Paperclip size={18} />
        </Button>
        <Field
          className={styles.composerField}
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          aria-label="Message"
          disabled={uploading}
        />
        <div className={styles.emojiWrap}>
          <Button
            type="button"
            variant="ghost"
            className={styles.iconBtn}
            aria-label="Insert emoji"
            aria-expanded={emojiOpen}
            onClick={() => setEmojiOpen((open) => !open)}
          >
            <Smile size={18} />
          </Button>
          <ChatEmojiPicker open={emojiOpen} onPick={insertEmoji} onClose={() => setEmojiOpen(false)} />
        </div>
        <Button
          type="button"
          className={styles.sendBtn}
          aria-label="Send"
          disabled={!input.trim() || sending || uploading}
          loading={sending}
          onClick={handleSend}
        >
          <Send size={18} />
        </Button>
      </footer>
    </section>
  );
}
