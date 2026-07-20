import type { PlatformConnectionProviderId } from '@pkg/types';

export type ConnectionFieldMeta = {
  label: string;
  tooltip: string;
  wide?: boolean;
};

export type ConnectionProviderMeta = {
  id: PlatformConnectionProviderId;
  title: string;
  blurb: string;
  docsUrl: string;
  docsLabel: string;
  fields: Record<string, ConnectionFieldMeta>;
  advancedFields?: Record<string, ConnectionFieldMeta>;
};

export const CONNECTION_PROVIDER_META: ConnectionProviderMeta[] = [
  {
    id: 'google',
    title: 'Google',
    blurb: 'Sign-in, Calendar, and Meet for teachers.',
    docsUrl: 'https://developers.google.com/identity/protocols/oauth2/web-server',
    docsLabel: 'Google OAuth documentation',
    fields: {
      googleClientId: {
        label: 'Client ID',
        tooltip:
          'Google Cloud Console → APIs & Services → Credentials → your OAuth 2.0 Client ID (Web application).',
      },
      googleClientSecret: {
        label: 'Client secret',
        tooltip: 'Same OAuth client → Client secret. Paste only when changing; leave blank to keep the saved value.',
      },
      googleCallbackUrl: {
        label: 'Callback URL',
        tooltip:
          'Add this exact URL under Authorized redirect URIs on the OAuth client. Typical value: https://your-api-host/api/auth/google/callback',
        wide: true,
      },
    },
    advancedFields: {
      googleSuccessRedirect: {
        label: 'Success redirect',
        tooltip:
          'Where the browser goes after a successful Google sign-in (default: /dashboard on your web app).',
        wide: true,
      },
    },
  },
  {
    id: 'facebook',
    title: 'Facebook',
    blurb: 'Optional link in Profile → Connections.',
    docsUrl: 'https://developers.facebook.com/docs/facebook-login/web',
    docsLabel: 'Facebook Login documentation',
    fields: {
      facebookAppId: {
        label: 'App ID',
        tooltip: 'Meta for Developers → your app → Settings → Basic → App ID.',
      },
      facebookAppSecret: {
        label: 'App secret',
        tooltip: 'Same app → Settings → Basic → App secret (Show). Leave blank to keep the saved secret.',
      },
      facebookCallbackUrl: {
        label: 'Callback URL',
        tooltip:
          'Facebook Login → Settings → Valid OAuth Redirect URIs. Use: https://your-api-host/api/auth/facebook/callback',
        wide: true,
      },
    },
  },
  {
    id: 'zoom',
    title: 'Zoom',
    blurb: 'OAuth + Meeting API for video lessons.',
    docsUrl: 'https://developers.zoom.us/docs/integrations/oauth/',
    docsLabel: 'Zoom OAuth documentation',
    fields: {
      zoomClientId: {
        label: 'Client ID',
        tooltip:
          'Zoom App Marketplace → Develop → your OAuth (or Server-to-Server) app → App Credentials → Client ID.',
      },
      zoomClientSecret: {
        label: 'Client secret',
        tooltip:
          'Same app → App Credentials → Client secret. Leave blank to keep the saved value.',
      },
      zoomWebhookSecret: {
        label: 'Webhook secret token',
        tooltip:
          'Zoom app → Feature → Event Subscriptions → Secret Token. Used to verify meeting.started/meeting.ended events.',
      },
      zoomCallbackUrl: {
        label: 'Callback URL',
        tooltip:
          'Add this URL under OAuth → Redirect URL for OAuth. Typical value: https://your-api-host/api/auth/zoom/callback',
        wide: true,
      },
      zoomUseServerToServer: {
        label: 'Use Server-to-Server OAuth',
        tooltip:
          'Enable when using a Server-to-Server OAuth app (no per-user link). Requires ZOOM_ACCOUNT_ID on the API.',
        wide: true,
      },
    },
  },
  {
    id: 'telegram',
    title: 'Telegram',
    blurb: 'Bot linking for notifications and Profile → Connect via Telegram.',
    docsUrl: 'https://core.telegram.org/bots#6-botfather',
    docsLabel: 'Telegram Bot API — BotFather',
    fields: {
      telegramBotToken: {
        label: 'Bot token',
        tooltip:
          'Open @BotFather in Telegram → /newbot (or /token) → copy the HTTP API token. Leave blank to keep the saved token.',
      },
      telegramBotUsername: {
        label: 'Bot username',
        tooltip:
          'Without @, e.g. my_school_bot. Shown in BotFather and used for the Login Widget; optional if the API can resolve it via getMe.',
      },
      telegramDevPolling: {
        label: 'Dev polling on localhost',
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
