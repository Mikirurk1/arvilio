'use client';

import {
  getLocaleMeta,
  LOCALE_COOKIE,
  replaceLocaleInPath,
  resolveSwitcherLocales,
  type Locale,
} from '@pkg/types';
import { ChevronDown } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useCampusI18n, useCampusT } from '../../lib/cms';
import { useOptionalAuth } from '../../lib/auth-context';
import { useProfileStore } from '../../stores/profile-store';
import { useSchoolLocales } from '../../hooks/use-school-locales';
import styles from './LocaleSwitcher.module.scss';

type Props = {
  /** Compact trigger (shortCode) for collapsed sidebar / tight chrome. */
  compact?: boolean;
  className?: string;
  /** Explicit locale subset. When omitted, the school's offered set (G33) is used. */
  enabledLocales?: readonly string[] | null;
  /** Where the list opens relative to the trigger. */
  menuPlacement?: 'top' | 'bottom';
};

export function LocaleSwitcher({
  compact = false,
  className,
  enabledLocales,
  menuPlacement = 'top',
}: Props) {
  const t = useCampusT();
  const { locale, setLocale } = useCampusI18n();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const auth = useOptionalAuth();
  const updateProfile = useProfileStore((s) => s.updateProfile);
  const schoolLocales = useSchoolLocales();

  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const options = useMemo(() => {
    const codes = resolveSwitcherLocales(enabledLocales ?? schoolLocales);
    const current = codes.includes(locale) ? locale : codes[0];
    const rest = codes
      .filter((c) => c !== current)
      .sort((a, b) =>
        getLocaleMeta(a).nativeName.localeCompare(
          getLocaleMeta(b).nativeName,
          locale,
          { sensitivity: 'base' },
        ),
      );
    return current ? [current, ...rest] : rest;
  }, [enabledLocales, schoolLocales, locale]);

  const currentMeta = getLocaleMeta(locale);

  const switchTo = async (next: Locale) => {
    setOpen(false);
    if (next === locale) return;
    setLocale(next);
    // Persist the choice so navigating to the default (unprefixed) locale isn't
    // redirected back by a stale locale cookie in proxy.ts (G33).
    if (typeof document !== 'undefined') {
      document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    }
    const search = searchParams?.toString();
    const nextPath = replaceLocaleInPath(pathname || '/', next);
    const href = search ? `${nextPath}?${search}` : nextPath;
    router.replace(href);
    if (auth?.user) {
      try {
        await updateProfile({ locale: next });
      } catch {
        /* preference sync is best-effort; URL already drives UI */
      }
    }
  };

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className={[styles.switcher, compact ? styles.compact : '', className]
        .filter(Boolean)
        .join(' ')}
      data-placement={menuPlacement}
    >
      <button
        type="button"
        className={styles.trigger}
        aria-label={t('locale.switcher.aria')}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={styles.triggerLabel}>
          {compact ? currentMeta.shortCode : currentMeta.nativeName}
        </span>
        <ChevronDown
          className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}
          size={14}
          strokeWidth={2.25}
          aria-hidden
        />
      </button>

      {open ? (
        <ul id={listId} className={styles.menu} role="listbox" aria-label={t('locale.switcher.aria')}>
          {options.map((code) => {
            const meta = getLocaleMeta(code);
            const selected = code === locale;
            return (
              <li key={code} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={`${styles.option} ${selected ? styles.active : ''}`}
                  onClick={() => void switchTo(code)}
                >
                  <span className={styles.optionNative}>{meta.nativeName}</span>
                  <span className={styles.optionCode}>{meta.shortCode}</span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
