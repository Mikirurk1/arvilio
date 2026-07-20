import type { PlatformConnectionProviderId } from '@pkg/types';

export type ConnectionFieldMeta = {
  labelKey: string;
  tooltip: string;
  wide?: boolean;
};

export type ConnectionProviderMeta = {
  id: PlatformConnectionProviderId;
  titleKey: string;
  blurbKey: string;
  docsUrl: string;
  docsLabel: string;
  fields: Record<string, ConnectionFieldMeta>;
  advancedFields?: Record<string, ConnectionFieldMeta>;
};

export const CONNECTION_PROVIDER_META: ConnectionProviderMeta[] = [
  {
    id: 'google',
    titleKey: 'system.connections.provider.google.title',
    blurbKey: 'system.connections.provider.google.blurb',
    docsUrl: 'https://developers.google.com/identity/protocols/oauth2/web-server',
    docsLabel: 'Google OAuth documentation',
    fields: {
      googleClientId: {
        labelKey: 'system.connections.field.googleClientId',
        tooltip:
          'Google Cloud Console → APIs & Services → Credentials → your OAuth 2.0 Client ID (Web application).',
      },
      googleClientSecret: {
        labelKey: 'system.connections.field.googleClientSecret',
        tooltip: 'Same OAuth client → Client secret. Paste only when changing; leave blank to keep the saved value.',
      },
      googleCallbackUrl: {
        labelKey: 'system.connections.field.googleCallbackUrl',
        tooltip:
          'Authorized redirect URI on the OAuth client. Must be the browser-facing web origin (Next /api rewrite), e.g. http://localhost:4200/api/auth/google/callback — not the Nest :3000 port, or auth cookies will not stick on the app host.',
        wide: true,
      },
    },
    advancedFields: {
      googleSuccessRedirect: {
        labelKey: 'system.connections.field.googleSuccessRedirect',
        tooltip:
          'Where the browser goes after a successful Google sign-in (default: /dashboard on your web app).',
        wide: true,
      },
    },
  },
  {
    id: 'facebook',
    titleKey: 'system.connections.provider.facebook.title',
    blurbKey: 'system.connections.provider.facebook.blurb',
    docsUrl: 'https://developers.facebook.com/docs/facebook-login/web',
    docsLabel: 'Facebook Login documentation',
    fields: {
      facebookAppId: {
        labelKey: 'system.connections.field.facebookAppId',
        tooltip: 'Meta for Developers → your app → Settings → Basic → App ID.',
      },
      facebookAppSecret: {
        labelKey: 'system.connections.field.facebookAppSecret',
        tooltip: 'Same app → Settings → Basic → App secret (Show). Leave blank to keep the saved secret.',
      },
      facebookCallbackUrl: {
        labelKey: 'system.connections.field.facebookCallbackUrl',
        tooltip:
          'Facebook Login → Settings → Valid OAuth Redirect URIs. Use: https://your-api-host/api/auth/facebook/callback',
        wide: true,
      },
    },
  },
  {
    id: 'zoom',
    titleKey: 'system.connections.provider.zoom.title',
    blurbKey: 'system.connections.provider.zoom.blurb',
    docsUrl: 'https://developers.zoom.us/docs/integrations/oauth/',
    docsLabel: 'Zoom OAuth documentation',
    fields: {
      zoomClientId: {
        labelKey: 'system.connections.field.zoomClientId',
        tooltip:
          'Zoom App Marketplace → Develop → your OAuth (or Server-to-Server) app → App Credentials → Client ID.',
      },
      zoomClientSecret: {
        labelKey: 'system.connections.field.zoomClientSecret',
        tooltip:
          'Same app → App Credentials → Client secret. Leave blank to keep the saved value.',
      },
      zoomWebhookSecret: {
        labelKey: 'system.connections.field.zoomWebhookSecret',
        tooltip:
          'Zoom app → Feature → Event Subscriptions → Secret Token. Used to verify meeting.started/meeting.ended events.',
      },
      zoomCallbackUrl: {
        labelKey: 'system.connections.field.zoomCallbackUrl',
        tooltip:
          'Add this URL under OAuth → Redirect URL for OAuth. Typical value: https://your-api-host/api/auth/zoom/callback',
        wide: true,
      },
      zoomUseServerToServer: {
        labelKey: 'system.connections.field.zoomUseServerToServer',
        tooltip:
          'Enable when using a Server-to-Server OAuth app (no per-user link). Requires ZOOM_ACCOUNT_ID on the API.',
        wide: true,
      },
    },
  },
  {
    id: 'telegram',
    titleKey: 'system.connections.provider.telegram.title',
    blurbKey: 'system.connections.provider.telegram.blurb',
    docsUrl: 'https://core.telegram.org/bots#6-botfather',
    docsLabel: 'Telegram Bot API — BotFather',
    fields: {
      telegramBotToken: {
        labelKey: 'system.connections.field.telegramBotToken',
        tooltip:
          'Open @BotFather in Telegram → /newbot (or /token) → copy the HTTP API token. Leave blank to keep the saved token.',
      },
      telegramBotUsername: {
        labelKey: 'system.connections.field.telegramBotUsername',
        tooltip:
          'Without @, e.g. my_school_bot. Shown in BotFather and used for the Login Widget; optional if the API can resolve it via getMe.',
      },
      telegramDevPolling: {
        labelKey: 'system.connections.field.telegramDevPolling',
        tooltip:
          'Enable only while testing bot /start linking on localhost. The Login Widget does not work on localhost; long polling is opt-in to avoid Telegram 409 conflicts.',
        wide: true,
      },
    },
  },
];

export function getConnectionMeta(id: PlatformConnectionProviderId): ConnectionProviderMeta {
  const meta = CONNECTION_PROVIDER_META.find((entry) => entry.id === id);
  if (!meta) throw new Error(`Unknown connection provider: ${id}`);
  return meta;
}
