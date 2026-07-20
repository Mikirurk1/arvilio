'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FileText } from 'lucide-react';
import type { ChatMessageDto } from '@pkg/types';
import { chatAttachmentHref } from '../../lib/chat-upload';
import { useCampusI18n, useCampusT } from '../../lib/cms';
import styles from './page.module.scss';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ChatMessageContent({ message }: { message: ChatMessageDto }) {
  const t = useCampusT();
  const { locale } = useCampusI18n();
  const attachment = message.attachment;
  const hasBody = Boolean(message.body.trim());
  const dateLocale = locale === 'uk' ? 'uk-UA' : 'en-US';

  return (
    <>
      {attachment ? (
        <div className={styles.attachmentBlock}>
          {attachment.expired ? (
            <p className={styles.attachmentExpired}>{t('chat.attachment.expired')}</p>
          ) : attachment.mimeType.startsWith('image/') ? (
            <Link
              href={chatAttachmentHref(attachment.url)}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.attachmentImageLink}
            >
              <Image
                src={chatAttachmentHref(attachment.url)}
                alt={attachment.fileName}
                className={styles.attachmentImage}
                width={480}
                height={320}
                style={{ width: '100%', height: 'auto' }}
                unoptimized
              />
            </Link>
          ) : (
            <Link
              href={chatAttachmentHref(attachment.url)}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.attachmentFileLink}
            >
              <FileText size={18} aria-hidden />
              <span>
                <span className={styles.attachmentFileName}>{attachment.fileName}</span>
                <span className={styles.attachmentFileMeta}>{formatBytes(attachment.sizeBytes)}</span>
              </span>
            </Link>
          )}
          {!attachment.expired ? (
            <p className={styles.attachmentExpiryHint}>
              {t('chat.attachment.availableUntil', {
                when: new Date(attachment.expiresAt).toLocaleString(dateLocale, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                }),
              })}
            </p>
          ) : null}
        </div>
      ) : null}
      {hasBody ? <p className={styles.bubbleText}>{message.body}</p> : null}
    </>
  );
}
