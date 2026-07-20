/** Session history for Ask Arvi — capped + TTL so it does not linger forever. */

export const ARVI_CHAT_HISTORY_KEY = 'arvi.assistant.history';
/** Drop stored transcript after this idle period (ms). */
export const ARVI_CHAT_HISTORY_TTL_MS = 30 * 60 * 1000;
export const ARVI_CHAT_HISTORY_MAX = 20;

export type ArviChatStoredMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  navigatePath?: string;
};

type StoredPayload = {
  updatedAt: number;
  messages: ArviChatStoredMessage[];
};

function isMessage(value: unknown): value is ArviChatStoredMessage {
  if (!value || typeof value !== 'object') return false;
  const m = value as ArviChatStoredMessage;
  return (
    typeof m.id === 'string' &&
    (m.role === 'user' || m.role === 'assistant') &&
    typeof m.content === 'string'
  );
}

export function loadArviChatHistory(
  now = Date.now(),
  storage: Pick<Storage, 'getItem' | 'removeItem'> | null = typeof sessionStorage !== 'undefined'
    ? sessionStorage
    : null,
): ArviChatStoredMessage[] {
  if (!storage) return [];
  try {
    const raw = storage.getItem(ARVI_CHAT_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredPayload | ArviChatStoredMessage[];

    // Legacy: bare array without TTL — treat as expired so we don't keep unbounded old sessions.
    if (Array.isArray(parsed)) {
      storage.removeItem(ARVI_CHAT_HISTORY_KEY);
      return [];
    }

    if (
      !parsed ||
      typeof parsed.updatedAt !== 'number' ||
      !Array.isArray(parsed.messages)
    ) {
      storage.removeItem(ARVI_CHAT_HISTORY_KEY);
      return [];
    }

    if (now - parsed.updatedAt > ARVI_CHAT_HISTORY_TTL_MS) {
      storage.removeItem(ARVI_CHAT_HISTORY_KEY);
      return [];
    }

    return parsed.messages.filter(isMessage).slice(-ARVI_CHAT_HISTORY_MAX);
  } catch {
    try {
      storage.removeItem(ARVI_CHAT_HISTORY_KEY);
    } catch {
      // ignore
    }
    return [];
  }
}

export function saveArviChatHistory(
  messages: ArviChatStoredMessage[],
  now = Date.now(),
  storage: Pick<Storage, 'setItem' | 'removeItem'> | null = typeof sessionStorage !== 'undefined'
    ? sessionStorage
    : null,
): void {
  if (!storage) return;
  try {
    const trimmed = messages.filter(isMessage).slice(-ARVI_CHAT_HISTORY_MAX);
    if (trimmed.length === 0) {
      storage.removeItem(ARVI_CHAT_HISTORY_KEY);
      return;
    }
    const payload: StoredPayload = { updatedAt: now, messages: trimmed };
    storage.setItem(ARVI_CHAT_HISTORY_KEY, JSON.stringify(payload));
  } catch {
    // ignore quota
  }
}

export function clearArviChatHistory(
  storage: Pick<Storage, 'removeItem'> | null = typeof sessionStorage !== 'undefined'
    ? sessionStorage
    : null,
): void {
  if (!storage) return;
  try {
    storage.removeItem(ARVI_CHAT_HISTORY_KEY);
  } catch {
    // ignore
  }
}
