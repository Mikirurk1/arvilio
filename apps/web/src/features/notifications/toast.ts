import type { ToastKind } from '../../stores/notifications-store';
import { useNotificationsStore } from '../../stores/notifications-store';

type ToastPayload = {
  title: string;
  description?: string;
  durationMs?: number;
};

function push(kind: ToastKind, payload: ToastPayload) {
  return useNotificationsStore.getState().pushToast({ kind, ...payload });
}

/** Imperative toast API (ported from addax_assessment notifications slice). */
export const toast = {
  info: (title: string, description?: string, durationMs?: number) =>
    push('info', { title, description, durationMs }),
  success: (title: string, description?: string, durationMs?: number) =>
    push('success', { title, description, durationMs }),
  warning: (title: string, description?: string, durationMs?: number) =>
    push('warning', { title, description, durationMs }),
  error: (title: string, description?: string, durationMs?: number) =>
    push('error', { title, description, durationMs }),
};

export { useNotificationsStore };
