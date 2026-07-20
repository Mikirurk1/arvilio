'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import styles from './template.module.scss';

/**
 * Page transition (redesign v2 V1-04): легкий fade+rise контенту при навігації.
 * Template ремаунтиться на кожен перехід — клас enter додається в effect,
 * тож анімація грає на клієнтських навігаціях.
 *
 * Чому не в render: module-scope `lastSection` живе й на сервері (процес
 * пам'ятає розділ між запитами) → SSR і клієнт рендерили б різні класи —
 * hydration mismatch. Рішення лише після mount: перший SSR-лоад не анімується
 * (продукт вантажиться в задачу — оркестрації не потрібні), переходи між
 * розділами — анімуються; той самий розділ (/lessons → /lessons/5) — ні.
 * Reduced motion гасить рух глобальним baseline (_motion.scss).
 */
let lastSection: string | null = null;

export default function Template({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [enter, setEnter] = useState(false);

  useEffect(() => {
    const section = pathname.split('/')[1] ?? '';
    if (lastSection !== null && lastSection !== section) setEnter(true);
    lastSection = section;
    // Лише на mount: template ремаунтиться кожну навігацію.
  }, []);

  return (
    <div className={enter ? `${styles.wrap} ${styles.enter}` : styles.wrap}>{children}</div>
  );
}
