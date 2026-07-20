import { NextRequest, NextResponse } from 'next/server';
import { getCampusTour, normalizeCampusLocale } from '../../../lib/cms/campus-cms';

export async function GET(request: NextRequest) {
  const locale = normalizeCampusLocale(request.nextUrl.searchParams.get('locale'));
  const trackId = request.nextUrl.searchParams.get('trackId')?.trim();
  if (!trackId) {
    return NextResponse.json({ error: 'trackId required' }, { status: 400 });
  }
  const tour = await getCampusTour(trackId, locale);
  return NextResponse.json({ tour });
}
