import type { ReactNode } from 'react';

/** Passthrough layout — no segment `loading.tsx` (Suspense) for this route. */
export default function StudentDetailsLayout({ children }: { children: ReactNode }) {
  return children;
}
