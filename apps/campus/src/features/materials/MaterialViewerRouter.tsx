'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookViewerPage } from './book-viewer/BookViewerPage';
import { fetchMaterialAttachmentMeta } from './media-viewer/material-meta-api';
import { openMediaViewer } from '../../stores/media-viewer-store';
import styles from './media-viewer/media-viewer.module.scss';

type Props = {
  attachmentId: string;
  subjectUserId?: string | null;
  returnTo?: string | null;
};

function MediaViewerDeepLinkRedirect({
  attachmentId,
  returnTo,
}: {
  attachmentId: string;
  returnTo?: string | null;
}) {
  const router = useRouter();

  useEffect(() => {
    openMediaViewer(attachmentId);
    const destination = returnTo?.startsWith('/') ? returnTo : '/materials';
    router.replace(destination);
  }, [attachmentId, returnTo, router]);

  return (
    <div className={styles.loadingState}>
      <p>Opening player…</p>
    </div>
  );
}

export function MaterialViewerRouter({ attachmentId, subjectUserId, returnTo }: Props) {
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; kind: 'book' | 'media' | 'unsupported' }
  >({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading' });

    fetchMaterialAttachmentMeta(attachmentId)
      .then((meta) => {
        if (cancelled) return;
        if (meta.mediaKind === 'pdf') {
          setState({ status: 'ready', kind: 'book' });
          return;
        }
        if (meta.mediaKind === 'audio' || meta.mediaKind === 'video') {
          setState({ status: 'ready', kind: 'media' });
          return;
        }
        setState({ status: 'ready', kind: 'unsupported' });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setState({
          status: 'error',
          message: error instanceof Error ? error.message : 'Failed to load file',
        });
      });

    return () => {
      cancelled = true;
    };
  }, [attachmentId]);

  if (state.status === 'loading') {
    return (
      <div className={styles.loadingState}>
        <p>Loading…</p>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className={styles.loadingState}>
        <p>{state.message}</p>
      </div>
    );
  }

  if (state.status === 'ready' && state.kind === 'book') {
    return (
      <BookViewerPage
        attachmentId={attachmentId}
        subjectUserId={subjectUserId}
        returnTo={returnTo}
      />
    );
  }

  if (state.status === 'ready' && state.kind === 'media') {
    return <MediaViewerDeepLinkRedirect attachmentId={attachmentId} returnTo={returnTo} />;
  }

  return (
    <div className={styles.loadingState}>
      <p>This file type cannot be opened in the viewer.</p>
    </div>
  );
}
