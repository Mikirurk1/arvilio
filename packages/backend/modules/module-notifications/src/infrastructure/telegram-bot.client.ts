/**
 * Minimal Telegram Bot API client (no Nest). Shared by notifications jobs and auth link welcome.
 */

import { getPlatformIntegrationRuntime } from '@be/platform-integration';

export function getTelegramBotToken(): string | null {
  return getPlatformIntegrationRuntime().telegram.botToken;
}

function botUsernameFromRuntime(): string | null {
  const raw = getPlatformIntegrationRuntime().telegram.botUsername;
  if (!raw) return null;
  return raw.replace(/^@/, '');
}

/** Resolve @username for Login Widget (env or Telegram getMe). */
export async function resolveTelegramBotUsername(): Promise<string | null> {
  const fromConfig = botUsernameFromRuntime();
  if (fromConfig) return fromConfig;

  const token = getTelegramBotToken();
  if (!token) return null;

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    if (!response.ok) return null;
    const payload = (await response.json()) as { ok?: boolean; result?: { username?: string } };
    const username = payload.result?.username?.trim();
    return username || null;
  } catch {
    return null;
  }
}

export function isLocalWebOrigin(): boolean {
  const webOrigin = process.env['WEB_ORIGIN'] ?? 'http://localhost:4200';
  return webOrigin.includes('localhost') || webOrigin.includes('127.0.0.1');
}

/** Long-poll bot updates in dev (localhost Login Widget is unsupported by Telegram). Opt-in only — avoids 409 when the token is used elsewhere. */
export function shouldTelegramDevPolling(): boolean {
  if (!getTelegramBotToken()) return false;
  if (process.env['TELEGRAM_DEV_POLLING'] === 'false') return false;
  return getPlatformIntegrationRuntime().telegram.devPolling;
}

export async function getTelegramWidgetConfig(): Promise<{
  available: boolean;
  botUsername: string | null;
  localhostWarning: boolean;
  botLinkFlow: boolean;
}> {
  const token = getTelegramBotToken();
  const botUsername = await resolveTelegramBotUsername();
  const localhostWarning = isLocalWebOrigin();
  const available = Boolean(token && botUsername);
  return {
    available,
    botUsername,
    localhostWarning,
    botLinkFlow: available && localhostWarning,
  };
}

type TelegramUpdate = {
  update_id: number;
  message?: {
    chat: { id: number };
    from?: {
      id: number;
      username?: string;
      first_name?: string;
      last_name?: string;
    };
    text?: string;
  };
};

/** Drop webhook so getUpdates works (dev polling). */
export async function deleteTelegramWebhook(): Promise<void> {
  const token = getTelegramBotToken();
  if (!token) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/deleteWebhook`);
  } catch {
    // ignore
  }
}

export type FetchTelegramUpdatesResult = {
  updates: TelegramUpdate[];
  /** HTTP 409 — another client is already polling this bot token. */
  conflict: boolean;
};

export async function fetchTelegramUpdates(
  offset: number,
  timeoutSeconds = 25,
): Promise<FetchTelegramUpdatesResult> {
  const token = getTelegramBotToken();
  if (!token) return { updates: [], conflict: false };

  const url = `https://api.telegram.org/bot${token}/getUpdates`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      offset,
      timeout: timeoutSeconds,
      allowed_updates: ['message'],
    }),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    if (response.status === 409) {
      return { updates: [], conflict: true };
    }
    console.warn(`[telegram] getUpdates HTTP ${response.status}: ${detail.slice(0, 200)}`);
    return { updates: [], conflict: false };
  }
  const payload = (await response.json()) as {
    ok?: boolean;
    description?: string;
    result?: TelegramUpdate[];
  };
  if (!payload.ok) {
    console.warn(`[telegram] getUpdates failed: ${payload.description ?? 'unknown'}`);
    return { updates: [], conflict: false };
  }
  return { updates: payload.result ?? [], conflict: false };
}

export function escapeTelegramHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export async function sendTelegramBotMessage(
  chatId: string,
  text: string,
  options?: { parseMode?: 'HTML' | 'Markdown' },
): Promise<boolean> {
  const token = getTelegramBotToken();
  if (!token) return false;

  const body: Record<string, unknown> = {
    chat_id: chatId,
    text,
    disable_web_page_preview: true,
  };
  if (options?.parseMode) {
    body['parse_mode'] = options.parseMode;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      console.warn(`[telegram] sendMessage failed: ${response.status} ${detail.slice(0, 200)}`);
      return false;
    }
    const payload = (await response.json()) as { ok?: boolean };
    return payload.ok === true;
  } catch (error) {
    console.warn('[telegram] sendMessage error', error);
    return false;
  }
}
