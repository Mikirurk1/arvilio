import { headers } from 'next/headers';
import './globals.scss';
import { AppProviders } from './providers';
import AppShell from '../components/layout/AppShell';
import {
  DEFAULT_FONT_SIZE_MODE,
  DEFAULT_RESOLVED_THEME_MODE,
  serializeInitialAppearanceScript,
} from '../lib/appearance/initial-appearance';
import {
  readRequestAuthState,
  serializeAuthBootstrap,
} from '../lib/auth/request-session';

export const metadata = {
  title: 'SoEnglish',
  description: 'SSR-first English learning platform',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const requestAuth = readRequestAuthState(await headers());

  return (
    <html
      lang="en"
      data-theme={DEFAULT_RESOLVED_THEME_MODE}
      data-font-size={DEFAULT_FONT_SIZE_MODE}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: serializeInitialAppearanceScript(),
          }}
        />
      </head>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__SOENGLISH_AUTH__=${serializeAuthBootstrap(requestAuth.user)};`,
          }}
        />
        <AppProviders initialAuthUser={requestAuth.user}>
          {requestAuth.route.shell === 'app' ? (
            <AppShell>{children}</AppShell>
          ) : (
            children
          )}
        </AppProviders>
      </body>
    </html>
  );
}
