import { NextRequest, NextResponse } from 'next/server';
import { getCampusPage, normalizeCampusLocale } from '../../../lib/cms/campus-cms';
import { lexicalToMarkdownSource } from '../../../lib/cms/lexical-html';

export async function GET(request: NextRequest) {
  const locale = normalizeCampusLocale(request.nextUrl.searchParams.get('locale'));
  const slug = request.nextUrl.searchParams.get('slug')?.trim();
  if (!slug) {
    return NextResponse.json({ error: 'slug required' }, { status: 400 });
  }
  const page = await getCampusPage(slug, locale);
  if (!page) {
    return NextResponse.json({ page: null });
  }
  return NextResponse.json({
    page: {
      slug: page.slug,
      title: page.title ?? null,
      subtitle: page.subtitle ?? null,
      bodyMarkdown: lexicalToMarkdownSource(page.body),
    },
  });
}
