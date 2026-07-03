import type { ReactNode } from 'react';
import layoutStyles from './auth-layout.module.scss';

export const metadata = {
  title: 'SoEnglish — Account',
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div data-auth-route className={layoutStyles.authRoot}>
      <aside className={layoutStyles.trustPanel}>
        <h2 className={layoutStyles.trustTitle}>Your English classroom, organized</h2>
        <p className={layoutStyles.trustCopy}>
          Lessons, practice, and messages in one calm place — built for students and teachers at your
          school.
        </p>
      </aside>
      <main className={layoutStyles.authMain}>{children}</main>
    </div>
  );
}
