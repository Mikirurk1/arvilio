import { NextRequest, NextResponse } from 'next/server';
import { getCampusStringMap, normalizeCampusLocale } from '../../../lib/cms/campus-cms';

/** Same-origin proxy so the browser never needs CORS to `@app/cms`. */
export async function GET(request: NextRequest) {
  const locale = normalizeCampusLocale(request.nextUrl.searchParams.get('locale'));
  const strings = await getCampusStringMap(locale);
  return NextResponse.json({ strings });
}
