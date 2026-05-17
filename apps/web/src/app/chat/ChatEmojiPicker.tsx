'use client';

import { useEffect, useRef } from 'react';
import { Button } from '../../components/ui';
import styles from './page.module.scss';

const CHAT_EMOJIS = [
  '😀', '😂', '🥹', '😊', '😍', '🤔', '😅', '🙌',
  '👍', '👎', '❤️', '🔥', '✨', '🎉', '💯', '🙏',
  '😢', '😡', '🤯', '😴', '🤗', '👀', '💪', '🫶',
  '🇺🇦', '🇬🇧', '☀️', '⭐', '📎', '✅', '❌', '❓',
] as const;

export function ChatEmojiPicker({
  open,
  onPick,
  onClose,
}: {
  open: boolean;
  onPick: (emoji: string) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      className={styles.emojiPicker}
      role="listbox"
      aria-label="Emoji"
    >
      {CHAT_EMOJIS.map((emoji) => (
        <Button
          key={emoji}
          type="button"
          variant="ghost"
          className={styles.emojiBtn}
          aria-label={emoji}
          onClick={() => {
            onPick(emoji);
            onClose();
          }}
        >
          {emoji}
        </Button>
      ))}
    </div>
  );
}
