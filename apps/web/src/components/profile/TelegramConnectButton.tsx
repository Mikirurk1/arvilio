'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Info } from 'lucide-react';
import type { TelegramLoginPayloadDto } from '@soenglish/shared-types';
import { apiClient, ApiError } from '../../lib/api';
import { toast } from '../../features/notifications';
import { Tooltip } from '../ui/Tooltip';
import styles from '../../app/profile/page.module.scss';

const LINK_STORAGE_KEY = 'soenglish_telegram_link_pending';

const TELEGRAM_CONNECT_TOOLTIP = (
  <>
    <strong>Як підключити (localhost)</strong>
    <br />
    1. Натисніть «Connect via Telegram» на сайті.
    <br />
    2. У Telegram натисніть <strong>Start</strong> у вікні після переходу з сайту.
    <br />
    3. Поверніться сюди — статус оновиться сам.
    <br />
    <br />
    Не натискайте Start у старому чаті без посилання з сайту.
  </>
);

type WidgetConfig = {
  available: boolean;
  botUsername: string | null;
  localhostWarning: boolean;
  botLinkFlow: boolean;
};

type LinkStart = {
  code: string;
  deepLink: string;
  tgDeepLink: string;
  expiresAt: string;
};

declare global {
  interface Window {
    onTelegramLinkAuth?: (user: TelegramLoginPayloadDto) => void;
  }
}

type Props = {
  onLinked?: () => void;
};

function readStoredLink(): LinkStart | null {
  if (typeof sessionStorage === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(LINK_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LinkStart;
    if (!parsed.code || !parsed.expiresAt) return null;
    if (new Date(parsed.expiresAt).getTime() < Date.now()) {
      sessionStorage.removeItem(LINK_STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function storeLink(data: LinkStart): void {
  sessionStorage.setItem(LINK_STORAGE_KEY, JSON.stringify(data));
}

function clearStoredLink(): void {
  sessionStorage.removeItem(LINK_STORAGE_KEY);
}

export function TelegramConnectButton({ onLinked }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLButtonElement>(null);
  const [config, setConfig] = useState<WidgetConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [botLink, setBotLink] = useState<LinkStart | null>(null);
  const [botLinkBusy, setBotLinkBusy] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  const loadWidget = useCallback(
    (botName: string) => {
      const host = containerRef.current;
      if (!host) return;

      window.onTelegramLinkAuth = async (user: TelegramLoginPayloadDto) => {
        try {
          await apiClient.post('/auth/telegram/link', user);
          toast.success(
            'Telegram connected',
            'You should receive a welcome message in Telegram. Enable alerts under Profile → Notifications.',
          );
          onLinked?.();
        } catch (error) {
          const message = error instanceof ApiError ? error.message : 'Could not connect Telegram';
          toast.error('Could not connect Telegram', message);
        }
      };

      host.innerHTML = '';
      const script = document.createElement('script');
      script.src = 'https://telegram.org/js/telegram-widget.js?22';
      script.async = true;
      script.setAttribute('data-telegram-login', botName);
      script.setAttribute('data-size', 'medium');
      script.setAttribute('data-onauth', 'onTelegramLinkAuth(user)');
      script.setAttribute('data-request-access', 'write');
      host.appendChild(script);
    },
    [onLinked],
  );

  useEffect(() => {
    const stored = readStoredLink();
    if (stored) setBotLink(stored);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void apiClient
      .get<WidgetConfig>('/auth/telegram/widget-config')
      .then((data) => {
        if (!cancelled) setConfig(data);
      })
      .catch(() => {
        if (!cancelled) {
          setConfig({
            available: false,
            botUsername: null,
            localhostWarning: false,
            botLinkFlow: false,
          });
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!config?.available || !config.botUsername || config.botLinkFlow) return;
    loadWidget(config.botUsername);
    return () => {
      delete window.onTelegramLinkAuth;
      if (containerRef.current) containerRef.current.innerHTML = '';
    };
  }, [config, loadWidget]);

  const pollLinkStatus = useCallback(
    (code: string) => {
      void apiClient
        .get<{ status: string }>(`/auth/telegram/link/status?code=${encodeURIComponent(code)}`)
        .then((res) => {
          if (res.status === 'linked') {
            clearStoredLink();
            setBotLink(null);
            toast.success('Telegram connected', 'Check Telegram for a welcome message.');
            onLinked?.();
          } else if (res.status === 'expired') {
            clearStoredLink();
            setBotLink(null);
            toast.error('Link expired', 'Click Connect again to get a new link.');
          }
        })
        .catch(() => undefined);
    },
    [onLinked],
  );

  useEffect(() => {
    if (!botLink) return;
    pollLinkStatus(botLink.code);
    const interval = window.setInterval(() => pollLinkStatus(botLink.code), 2000);
    return () => window.clearInterval(interval);
  }, [botLink, pollLinkStatus]);

  const openTelegram = (data: LinkStart) => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const url = isMobile ? data.deepLink : data.tgDeepLink || data.deepLink;
    window.location.assign(url);
  };

  const startBotLink = async () => {
    setBotLinkBusy(true);
    try {
      const data = await apiClient.post<LinkStart>('/auth/telegram/link/start', {});
      storeLink(data);
      setBotLink(data);
      openTelegram(data);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Could not start Telegram link';
      toast.error('Could not connect Telegram', message);
    } finally {
      setBotLinkBusy(false);
    }
  };

  if (loading) {
    return <span className={styles.linkedMeta}>Loading Telegram…</span>;
  }

  if (!config?.available) {
    return (
      <span
        className={`${styles.linkedBadge} ${styles.linkedBadgeOff}`}
        title="Add TELEGRAM_BOT_TOKEN to .env (from @BotFather), restart dev server"
      >
        Not configured
      </span>
    );
  }

  if (config.botLinkFlow) {
    return (
      <div className={styles.telegramConnectRow}>
        <button
          ref={infoRef}
          type="button"
          className={styles.telegramInfoBtn}
          aria-label="Інструкція підключення Telegram"
          onMouseEnter={() => setInfoOpen(true)}
          onMouseLeave={() => setInfoOpen(false)}
          onFocus={() => setInfoOpen(true)}
          onBlur={() => setInfoOpen(false)}
        >
          <Info size={14} aria-hidden />
        </button>
        <Tooltip
          open={infoOpen}
          targetEl={infoRef.current}
          placement="left"
          className={styles.telegramTooltip}
          content={TELEGRAM_CONNECT_TOOLTIP}
        />
        <button
          type="button"
          className={styles.linkedConnectBtn}
          disabled={botLinkBusy}
          onClick={() => void (botLink ? openTelegram(botLink) : startBotLink())}
        >
          {botLink ? 'Open Telegram again' : 'Connect via Telegram'}
        </button>
      </div>
    );
  }

  return <div ref={containerRef} className={styles.telegramWidgetHost} />;
}
