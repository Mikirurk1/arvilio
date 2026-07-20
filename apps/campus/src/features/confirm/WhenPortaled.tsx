'use client';

import { ReactNode } from 'react';
import { BodyPortal } from '../../components/ui/BodyPortal';

type WhenPortaledProps = {
  when: boolean;
  /** Use a function so content is not evaluated when `when` is false (avoids null deref in parents). */
  children: ReactNode | (() => ReactNode);
};

/** Renders `children` on `document.body` when `when` is true (for confirm overlays above modals). */
export function WhenPortaled({ when, children }: WhenPortaledProps) {
  if (!when) return null;
  const content = typeof children === 'function' ? children() : children;
  return <BodyPortal>{content}</BodyPortal>;
}
