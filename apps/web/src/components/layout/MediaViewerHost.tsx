'use client';

import { useMediaViewerStore } from '../../stores/media-viewer-store';
import { MediaViewerModal } from '../../features/materials/media-viewer/MediaViewerModal';

export function MediaViewerHost() {
  const attachmentId = useMediaViewerStore((state) => state.attachmentId);
  const close = useMediaViewerStore((state) => state.close);

  return (
    <MediaViewerModal
      attachmentId={attachmentId ?? ''}
      open={Boolean(attachmentId)}
      onClose={close}
    />
  );
}
