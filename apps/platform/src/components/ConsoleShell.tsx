import Link from 'next/link';
import type { ReactNode } from 'react';
import styles from './ConsoleShell.module.scss';

/**
 * Platform console shell. The nav IA deliberately reserves the Phase 6 surfaces
 * (Leads / Marketplace / Recruiting) as disabled stubs so the information
 * architecture and permission model do not need restructuring when they land
 * (ADR-009, plan Phase 4 "seams for the next stage").
 */
const NAV: Array<{ label: string; href?: string; soon?: boolean }> = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Schools', href: '/schools' },
  { label: 'Promo codes', href: '/promo-codes' },
  { label: 'Audit log', href: '/audit-log' },
  { label: 'Leads', soon: true },
  { label: 'Marketplace', soon: true },
  { label: 'Recruiting', soon: true },
  { label: 'Settings', href: '/settings' },
];

export function ConsoleShell({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>Arvilio Platform</div>
        <nav className={styles.nav}>
          {NAV.map((item) =>
            item.href && !item.soon ? (
              <Link key={item.label} href={item.href} className={styles.navItem}>
                {item.label}
              </Link>
            ) : (
              <span key={item.label} className={`${styles.navItem} ${styles.navSoon}`}>
                {item.label}
                <em className={styles.soonTag}>soon</em>
              </span>
            ),
          )}
        </nav>
      </aside>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
