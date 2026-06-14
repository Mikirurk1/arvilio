export type MaterialViewerLinkOptions = {
  fileAttachmentId: string;
  subjectUserId?: string | null;
  returnTo?: string | null;
};

/** @deprecated Use materialViewerHref */
export function bookViewerHref(options: MaterialViewerLinkOptions): string {
  return materialViewerHref(options);
}

export function materialViewerHref({
  fileAttachmentId,
  subjectUserId,
  returnTo,
}: MaterialViewerLinkOptions): string {
  const params = new URLSearchParams();
  if (subjectUserId?.trim()) params.set('subjectUserId', subjectUserId.trim());
  if (returnTo?.trim()) params.set('returnTo', returnTo.trim());
  const query = params.toString();
  return query
    ? `/materials/view/${encodeURIComponent(fileAttachmentId)}?${query}`
    : `/materials/view/${encodeURIComponent(fileAttachmentId)}`;
}
