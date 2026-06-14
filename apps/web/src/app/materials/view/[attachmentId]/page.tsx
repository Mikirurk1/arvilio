'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { MaterialViewerRouter } from '../../../../features/materials/MaterialViewerRouter';

export default function MaterialBookViewerRoute() {
  const params = useParams<{ attachmentId: string }>();
  const searchParams = useSearchParams();
  const attachmentId = params.attachmentId;
  const subjectUserId = searchParams.get('subjectUserId');
  const returnTo = searchParams.get('returnTo');

  if (!attachmentId) {
    return null;
  }

  return (
    <MaterialViewerRouter
      attachmentId={attachmentId}
      subjectUserId={subjectUserId}
      returnTo={returnTo}
    />
  );
}
