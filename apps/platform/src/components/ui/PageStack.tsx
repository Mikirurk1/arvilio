import type { ReactNode } from 'react';
import styles from './ui.module.scss';

export function PageStack({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={[styles.pageStack, className].filter(Boolean).join(' ')}>{children}</div>;
}

export function PageGrid({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={[styles.pageGrid, className].filter(Boolean).join(' ')}>{children}</div>;
}
