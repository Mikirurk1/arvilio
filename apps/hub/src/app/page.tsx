import { redirect } from 'next/navigation';
import { DEFAULT_LOCALE } from '@pkg/types';

/** Root `/` is also handled by middleware; this is a belt-and-suspenders fallback. */
export default function RootPage() {
  redirect(`/${DEFAULT_LOCALE}`);
}
