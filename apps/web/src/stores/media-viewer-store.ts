'use client';

import { create } from 'zustand';

type MediaViewerStore = {
  attachmentId: string | null;
  open: (attachmentId: string) => void;
  close: () => void;
};

export const useMediaViewerStore = create<MediaViewerStore>((set) => ({
  attachmentId: null,
  open: (attachmentId) => set({ attachmentId }),
  close: () => set({ attachmentId: null }),
}));

export function openMediaViewer(attachmentId: string): void {
  useMediaViewerStore.getState().open(attachmentId);
}

export function closeMediaViewer(): void {
  useMediaViewerStore.getState().close();
}
