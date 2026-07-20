import type { Metadata } from 'next';
import { headers } from 'next/headers';
import './globals.scss';
import '@livekit/components-styles';
import { AppProviders } from './providers';
import { AppShellGate } from '../components/layout/AppShellGate';
import { ImpersonationBanner } from '../components/layout/ImpersonationBanner';
import { TrialBanner } from '../components/layout/TrialBanner';
import { BrandingBootstrap } from '../components/layout/BrandingBootstrap';
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
import { getCampusGlobalSeo, getCampusStringMap } from '../lib/cms/campus-cms';
import { normalizeCampusLocale } from '../lib/cms';

export async function generateMetadata(): Promise<Metadata> {
  const requestAuth = readRequestAuthState(await headers());
  const locale = normalizeCampusLocale(requestAuth.locale);
  const seo = await getCampusGlobalSeo(locale);
  const verification: Metadata['verification'] = {};
  if (seo.googleSiteVerification) verification.google = seo.googleSiteVerification;
  if (seo.bingSiteVerification) {
    verification.other = { 'msvalidate.01': seo.bingSiteVerification };
  }
  return {
    title: {
      default: seo.siteName?.trim() || 'Arvilio Campus',
      template: seo.titleTemplate?.trim() || '%s | Campus',
    },
    description: seo.defaultSeoDescription?.trim() || undefined,
    icons: {
      icon: [
        { url: '/brand/logo-mark.svg', type: 'image/svg+xml' },
        { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
        { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      ],
      apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    },
    ...(Object.keys(verification).length ? { verification } : {}),
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const requestAuth = readRequestAuthState(await headers());
  const locale = normalizeCampusLocale(requestAuth.locale);
  const campusStrings = await getCampusStringMap(locale);

  return (
    <html
      lang={locale}
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
            __html: `window.__ARVILIO_AUTH__=${serializeAuthBootstrap(requestAuth.user)};`,
          }}
        />
        {requestAuth.impersonation ? (
          <ImpersonationBanner schoolId={requestAuth.impersonation.schoolId} />
        ) : null}
        {requestAuth.trial ? <TrialBanner daysLeft={requestAuth.trial.daysLeft} /> : null}
        <AppProviders
          initialAuthUser={requestAuth.user}
          initialLocale={locale}
          initialCampusStrings={campusStrings}
        >
          <BrandingBootstrap />
          <AppShellGate initialShell={requestAuth.route.shell}>{children}</AppShellGate>
        </AppProviders>
      </body>
    </html>
  );
}
