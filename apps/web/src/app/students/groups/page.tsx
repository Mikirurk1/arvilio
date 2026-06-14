'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Legacy route — redirects to Students page Groups view. */
export default function StudentGroupsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/students?view=groups');
  }, [router]);

  return null;
}
