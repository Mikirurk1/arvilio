'use client';

import { ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

/** Renders children on `document.body` so fixed overlays stack above portaled modals. */
export function BodyPortal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  return createPortal(children, document.body);
}
