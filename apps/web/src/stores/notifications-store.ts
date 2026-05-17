'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type ToastKind = 'success' | 'info' | 'warning' | 'error';

export type ToastItem = {
  id: string;
  kind: ToastKind;
  title: string;
  description?: string;
  createdAt: number;
  durationMs: number;
};

type PushToastPayload = {
  kind?: ToastKind;
  title: string;
  description?: string;
  durationMs?: number;
  id?: string;
};

type NotificationsState = {
  toasts: ToastItem[];
  pushToast: (payload: PushToastPayload) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
};

function genToastId() {
  return `toast_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

const MAX_TOASTS = 5;

export const useNotificationsStore = create<NotificationsState>()(
  devtools(
    (set, get) => ({
      toasts: [],

      pushToast: (payload) => {
        const id = payload.id ?? genToastId();
        const kind = payload.kind ?? 'info';
        const durationMs = payload.durationMs ?? 3200;
        const item: ToastItem = {
          id,
          kind,
          title: payload.title,
          description: payload.description,
          createdAt: Date.now(),
          durationMs,
        };

        set(
          (state) => ({
            toasts: [item, ...state.toasts.filter((t) => t.id !== id)].slice(0, MAX_TOASTS),
          }),
          false,
          'notifications/push',
        );

        if (typeof window !== 'undefined') {
          window.setTimeout(() => {
            if (get().toasts.some((t) => t.id === id)) {
              get().removeToast(id);
            }
          }, durationMs);
        }

        return id;
      },

      removeToast: (id) => {
        set(
          (state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }),
          false,
          'notifications/remove',
        );
      },

      clearToasts: () => {
        set({ toasts: [] }, false, 'notifications/clear');
      },
    }),
    { name: 'soenglish/notifications' },
  ),
);
