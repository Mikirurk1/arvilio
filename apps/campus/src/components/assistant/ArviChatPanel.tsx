'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { X, Send, MapPin } from 'lucide-react';
import { Button } from '../ui';
import { Mascot } from '../mascot/Mascot';
import { useArvi } from '../mascot/useArvi';
import { useArviChat } from './useArviChat';
import { API_BASE } from '../../lib/api';
import { useCampusI18n, useCampusT } from '../../lib/cms';
import { prefersReducedMotion } from '../../lib/motion';
import { useActiveRoleKey } from '../../lib/active-user';
import {
  loadArviChatHistory,
  saveArviChatHistory,
  type ArviChatStoredMessage,
} from './arvi-chat-history';
import styles from './ArviChatPanel.module.scss';

/** Fallback if transitionend is missed (background tab, etc.). */
const CLOSE_FALLBACK_MS = 280;

type AssistantWelcomeRole = 'student' | 'teacher' | 'admin';

function toAssistantWelcomeRole(role: string): AssistantWelcomeRole {
  if (role === 'teacher') return 'teacher';
  if (role === 'admin' || role === 'super_admin') return 'admin';
  return 'student';
}

type ChatMessage = ArviChatStoredMessage;

type AssistantStatus = {
  ready: boolean;
  message: string | null;
};

async function fetchAssistantStatus(signal?: AbortSignal): Promise<{
  status: AssistantStatus | null;
  featureBlocked: boolean;
  error: string | null;
}> {
  const response = await fetch(`${API_BASE}/assistant/status`, {
    method: 'GET',
    credentials: 'include',
    headers: { Accept: 'application/json' },
    signal,
  });
  if (response.status === 403) {
    try {
      const json = (await response.json()) as { featureBlocked?: string; message?: string };
      if (json.featureBlocked === 'aiAssist') {
        return { status: null, featureBlocked: true, error: null };
      }
      return {
        status: null,
        featureBlocked: false,
        error: json.message ?? 'Assistant unavailable',
      };
    } catch {
      return { status: null, featureBlocked: true, error: null };
    }
  }
  if (!response.ok) {
    return {
      status: null,
      featureBlocked: false,
      error: `Assistant status error (${response.status})`,
    };
  }
  const data = (await response.json()) as AssistantStatus;
  return { status: data, featureBlocked: false, error: null };
}

async function streamAssistantChat(opts: {
  message: string;
  history: Array<{ role: 'user' | 'assistant'; content: string }>;
  pathname: string;
  locale: string;
  onDelta: (text: string) => void;
  onNavigate: (path: string) => void;
  onRefused: (message: string) => void;
  signal?: AbortSignal;
}): Promise<string> {
  const response = await fetch(`${API_BASE}/assistant/chat`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      Accept: 'text/event-stream',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: opts.message,
      history: opts.history,
      pathname: opts.pathname,
      locale: opts.locale,
    }),
    signal: opts.signal,
  });

  if (!response.ok) {
    let message = `Assistant error (${response.status})`;
    try {
      const json = (await response.json()) as {
        message?: string | string[];
        featureBlocked?: string;
      };
      if (json.featureBlocked === 'aiAssist') {
        message =
          'AI assist requires the Pro plan. Ask your school admin to upgrade.';
      } else if (Array.isArray(json.message)) {
        message = json.message.join(', ');
      } else if (json.message) {
        message = json.message;
      }
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  if (!response.body) throw new Error('No response stream');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let full = '';
  let eventName = 'message';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split('\n');
    buffer = parts.pop() ?? '';

    for (const line of parts) {
      if (line.startsWith('event:')) {
        eventName = line.slice(6).trim();
        continue;
      }
      if (!line.startsWith('data:')) continue;
      const payload = line.slice(5).trim();
      if (!payload) continue;
      try {
        const data = JSON.parse(payload) as Record<string, string>;
        if (eventName === 'delta' && data.text) {
          full += data.text;
          opts.onDelta(data.text);
        } else if (eventName === 'navigate' && data.path) {
          opts.onNavigate(data.path);
        } else if (eventName === 'refused' && data.message) {
          full = data.message;
          opts.onRefused(data.message);
        } else if (eventName === 'done' && data.text) {
          full = data.text;
        } else if (eventName === 'error' && data.message) {
          throw new Error(data.message);
        }
      } catch (err) {
        if (err instanceof Error && err.message !== 'Unexpected end of JSON input') {
          if (eventName === 'error' || (err as Error).message.includes('Assistant')) {
            throw err;
          }
        }
      }
    }
  }

  return full;
}

export function ArviChatPanel() {
  const t = useCampusT();
  const { locale } = useCampusI18n();
  const welcomeRole = toAssistantWelcomeRole(useActiveRoleKey());
  const { open, setOpen } = useArviChat();
  const { react } = useArvi();
  const pathname = usePathname() ?? '/dashboard';
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<AssistantStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [featureBlocked, setFeatureBlocked] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [closing, setClosing] = useState(false);

  const finishClose = useCallback(() => {
    setClosing(false);
    setOpen(false);
  }, [setOpen]);

  const requestClose = useCallback(() => {
    if (!open || closing) return;
    if (prefersReducedMotion()) {
      setOpen(false);
      return;
    }
    setClosing(true);
  }, [open, closing, setOpen]);

  useEffect(() => {
    if (!closing) return undefined;
    const timer = window.setTimeout(finishClose, CLOSE_FALLBACK_MS);
    return () => window.clearTimeout(timer);
  }, [closing, finishClose]);

  useEffect(() => {
    if (!open) setClosing(false);
  }, [open]);

  useEffect(() => {
    if (!open || closing) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') requestClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, closing, requestClose]);

  useEffect(() => {
    if (!open) return;
    setMessages(loadArviChatHistory());
    const ac = new AbortController();
    setStatusLoading(true);
    setFeatureBlocked(false);
    setError(null);
    void fetchAssistantStatus(ac.signal)
      .then((result) => {
        if (ac.signal.aborted) return;
        setFeatureBlocked(result.featureBlocked);
        setStatus(result.status);
        if (result.error) setError(result.error);
      })
      .catch((err) => {
        if (ac.signal.aborted) return;
        if ((err as Error).name === 'AbortError') return;
        setError(err instanceof Error ? err.message : t('assistant.error'));
      })
      .finally(() => {
        if (!ac.signal.aborted) setStatusLoading(false);
      });
    return () => ac.abort();
  }, [open, t]);

  // Corner dock hides via GlobalArviSlot `open` check — do not toggle
  // shared `slotVisible` (that flag is owned by ProductTour).

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages, pending]);

  const chatReady = Boolean(status?.ready) && !featureBlocked;

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || pending || !chatReady) return;
    setInput('');
    setError(null);
    setPending(true);
    react('think');

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
    };
    const assistantId = `a-${Date.now()}`;
    const assistantPlaceholder: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
    };
    setMessages((prev) => {
      const next = [...prev, userMsg, assistantPlaceholder];
      saveArviChatHistory(next);
      return next;
    });

    const history = [...messages, userMsg]
      .filter((m) => m.content)
      .slice(-6)
      .map((m) => ({ role: m.role, content: m.content }));

    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    let navigatePath: string | undefined;

    try {
      const full = await streamAssistantChat({
        message: text,
        history,
        pathname,
        locale: locale === 'uk' ? 'uk' : 'en',
        signal: ac.signal,
        onDelta: (chunk) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: m.content + chunk } : m,
            ),
          );
        },
        onNavigate: (path) => {
          navigatePath = path;
        },
        onRefused: (message) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: message } : m,
            ),
          );
          react('encourage');
        },
      });

      setMessages((prev) => {
        const next = prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                content: full || m.content,
                navigatePath,
              }
            : m,
        );
        saveArviChatHistory(next);
        return next;
      });
      react('celebrate', 1600);
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('assistant.error');
      setError(msg);
      setMessages((prev) => prev.filter((m) => m.id !== assistantId));
      react('encourage');
    } finally {
      setPending(false);
    }
  }, [input, pending, messages, pathname, locale, react, t, chatReady]);

  if (!open) return null;

  const showUnavailable =
    !statusLoading && (featureBlocked || (status !== null && !status.ready));

  return (
    <div
      ref={panelRef}
      className={`${styles.panel}${closing ? ` ${styles.panelClosing}` : ''}`}
      role="dialog"
      aria-label={t('assistant.title')}
      aria-hidden={closing || undefined}
      data-arvi-chat
      onTransitionEnd={(event) => {
        if (event.target !== event.currentTarget) return;
        if (!closing) return;
        finishClose();
      }}
    >
      <header className={styles.header}>
        <div className={styles.brand}>
          <Mascot pose="greet" size={40} />
          <div>
            <p className={styles.title}>{t('assistant.title')}</p>
            <p className={styles.subtitle}>
              {t(`assistant.subtitle.${welcomeRole}`)}
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          aria-label={t('assistant.close')}
          onClick={requestClose}
          startIcon={<X size={18} />}
        />
      </header>

      <div className={styles.messages} ref={listRef}>
        {showUnavailable ? (
          <div className={styles.unavailable} role="status">
            <p className={styles.unavailableTitle}>{t('assistant.unavailable.title')}</p>
            <p className={styles.unavailableBody}>
              {featureBlocked
                ? t('assistant.proRequired')
                : (status?.message ?? t('assistant.unavailable.body'))}
            </p>
          </div>
        ) : null}
        {!showUnavailable && messages.length === 0 ? (
          <div className={styles.welcome} role="status">
            <p className={styles.welcomeTitle}>{t('assistant.welcome.title')}</p>
            <p className={styles.welcomeBody}>
              {t(`assistant.welcome.${welcomeRole}.body`)}
            </p>
            <ul className={styles.welcomeList}>
              <li>{t(`assistant.welcome.${welcomeRole}.can.navigate`)}</li>
              <li>{t(`assistant.welcome.${welcomeRole}.can.explain`)}</li>
              <li>{t(`assistant.welcome.${welcomeRole}.can.link`)}</li>
            </ul>
            <p className={styles.welcomeCannot}>
              {t(`assistant.welcome.${welcomeRole}.cannot`)}
            </p>
          </div>
        ) : null}
        {!showUnavailable
          ? messages.map((m) => (
              <div
                key={m.id}
                className={m.role === 'user' ? styles.userBubble : styles.botBubble}
              >
                <p className={styles.bubbleText}>{m.content || (pending ? '…' : '')}</p>
                {m.navigatePath ? (
                  <Button
                    type="button"
                    variant="ghost"
                    className={styles.navBtn}
                    startIcon={<MapPin size={14} />}
                    onClick={() => {
                      setOpen(false);
                      router.push(m.navigatePath!);
                    }}
                  >
                    {t('assistant.openPage')} {m.navigatePath}
                  </Button>
                ) : null}
              </div>
            ))
          : null}
      </div>

      {error ? <p className={styles.error}>{error}</p> : null}

      <form
        className={styles.composer}
        onSubmit={(e) => {
          e.preventDefault();
          void send();
        }}
      >
        <input
          className={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            showUnavailable
              ? t('assistant.unavailable.placeholder')
              : t('assistant.placeholder')
          }
          disabled={pending || statusLoading || !chatReady}
          aria-label={t('assistant.placeholder')}
        />
        <Button
          type="submit"
          loading={pending}
          loadingLabel={t('assistant.sending')}
          disabled={!input.trim() || !chatReady || statusLoading}
          startIcon={<Send size={16} />}
          aria-label={t('assistant.send')}
        />
      </form>
    </div>
  );
}
