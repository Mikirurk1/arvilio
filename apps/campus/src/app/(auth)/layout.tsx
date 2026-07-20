import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Suspense } from 'react';
import { LocaleSwitcher } from '../../components/i18n/LocaleSwitcher';
import { getCampusGlobalSeo } from '../../lib/cms/campus-cms';
import { resolveRequestCampusLocale } from '../../lib/cms/request-locale';
import styles from './auth-layout.module.scss';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolveRequestCampusLocale();
  const seo = await getCampusGlobalSeo(locale);
  const verification: Metadata['verification'] = {};
  if (seo.googleSiteVerification) verification.google = seo.googleSiteVerification;
  if (seo.bingSiteVerification) {
    verification.other = { 'msvalidate.01': seo.bingSiteVerification };
  }
  return {
    title: seo.siteName?.trim()
      ? { default: 'Account', template: seo.titleTemplate?.trim() || '%s | Campus' }
      : 'Arvilio Campus — Account',
    description: seo.defaultSeoDescription?.trim() || undefined,
    ...(Object.keys(verification).length ? { verification } : {}),
  };
}

/**
 * Auth shell: single centered column. No trust-panel / Arvi here —
 * those caused hydrate blink and a heavy 3D load on login/signup.
 * `data-auth-route` hides app chrome via globals.scss.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div data-auth-route className={styles.authRoot}>
      <div className={styles.localeBar}>
        <Suspense fallback={null}>
          <LocaleSwitcher menuPlacement="bottom" />
        </Suspense>
      </div>
      <main className={styles.authMain}>{children}</main>
    </div>
  );
}
