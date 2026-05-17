'use client';

import { FileText } from 'lucide-react';
import type { ChatMessageDto } from '@soenglish/shared-types';
import { API_BASE } from '../../lib/api';
import styles from './page.module.scss';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ChatMessageContent({ message }: { message: ChatMessageDto }) {
  const attachment = message.attachment;
  const hasBody = Boolean(message.body.trim());

  return (
    <>
      {attachment ? (
        <div className={styles.attachmentBlock}>
          {attachment.expired ? (
            <p className={styles.attachmentExpired}>
              File expired — chat files are deleted after 24 hours.
            </p>
          ) : attachment.mimeType.startsWith('image/') ? (
            <a
              href={`${API_BASE}${attachment.url}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.attachmentImageLink}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${API_BASE}${attachment.url}`}
                alt={attachment.fileName}
                className={styles.attachmentImage}
              />
            </a>
          ) : (
            <a
              href={`${API_BASE}${attachment.url}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.attachmentFileLink}
            >
              <FileText size={18} aria-hidden />
              <span>
                <span className={styles.attachmentFileName}>{attachment.fileName}</span>
                <span className={styles.attachmentFileMeta}>{formatBytes(attachment.sizeBytes)}</span>
              </span>
            </a>
          )}
          {!attachment.expired ? (
            <p className={styles.attachmentExpiryHint}>
              Available until{' '}
              {new Date(attachment.expiresAt).toLocaleString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          ) : null}
        </div>
      ) : null}
      {hasBody ? <p className={styles.bubbleText}>{message.body}</p> : null}
    </>
  );
}
