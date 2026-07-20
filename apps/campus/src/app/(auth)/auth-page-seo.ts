import type { Metadata } from 'next';
import {
  buildCampusPublicMetadata,
} from '../../lib/cms/campus-cms';
import { resolveRequestCampusLocale } from '../../lib/cms/request-locale';

/** Shared generateMetadata for public auth Content slugs. */
export function authPageMetadata(opts: {
  slug: string;
  path: string;
  fallbackTitle: string;
}): () => Promise<Metadata> {
  return async () => {
    const locale = await resolveRequestCampusLocale();
    return buildCampusPublicMetadata({
      slug: opts.slug,
      locale,
      path: opts.path,
      fallbackTitle: opts.fallbackTitle,
    });
  };
}
