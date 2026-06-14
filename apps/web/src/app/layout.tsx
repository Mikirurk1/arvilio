import { headers } from 'next/headers';
import './globals.scss';
import '@livekit/components-styles';
import { AppProviders } from './providers';
import { AppShellGate } from '../components/layout/AppShellGate';
import {
  DEFAULT_FONT_SIZE_MODE,
  DEFAULT_RESOLVED_THEME_MODE,
  serializeInitialAppearanceScript,
} from '../lib/appearance/initial-appearance';
import { fontClassNames, fontSans } from '../lib/fonts';
import {
  readRequestAuthState,
  serializeAuthBootstrap,
} from '../lib/auth/request-session';

export const metadata = {
  title: 'SoEnglish',
  description: 'SSR-first English learning platform',
  icons: {
    icon: [
      { url: '/brand/logo-mark.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
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
      className={fontClassNames}
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
      <body className={fontSans.className}>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__SOENGLISH_AUTH__=${serializeAuthBootstrap(requestAuth.user)};`,
          }}
        />
        <AppProviders initialAuthUser={requestAuth.user}>
          <AppShellGate initialShell={requestAuth.route.shell}>{children}</AppShellGate>
        </AppProviders>
      </body>
    </html>
  );
}
