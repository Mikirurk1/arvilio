'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';
import { ArviSlot } from './ArviSlot';
import { useArvi } from './useArvi';
import { useArviChat } from '../assistant/useArviChat';
import { useCampusT } from '../../lib/cms';
import styles from './ArviSlot.module.scss';

const AUTH_PREFIXES = ['/login', '/signup', '/forgot-password', '/reset-password', '/mascot-preview'];

/**
 * Docked Arvi for authenticated app shells. Hidden on auth routes (those use
 * an inline greet slot) and when logged out. Click opens Arvi AI help chat.
 *
 * Keep the slot mounted while chat is open or the product tour hides the corner
 * (visually parked) so we do not remount WebGL / reset pose timers.
 */
export function GlobalArviSlot() {
  const { user } = useAuth();
  const { slotVisible } = useArvi();
  const { open, toggle } = useArviChat();
  const t = useCampusT();
  const pathname = usePathname() ?? '';
  const onAuthRoute = AUTH_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  if (!user || onAuthRoute) return null;
  const parked = open || !slotVisible;
  return (
    <ArviSlot
      variant="corner"
      size={72}
      eager
      decorative={parked}
      interactive={!parked}
      onActivate={parked ? undefined : toggle}
      ariaLabel={t('assistant.open')}
      className={parked ? styles.parked : undefined}
    />
  );
}
