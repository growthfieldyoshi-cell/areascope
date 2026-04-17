import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const CANONICAL_HOST = 'areascope.jp';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') ?? '';

  // areascope.jp（および www.areascope.jp）以外のホスト（Vercelプレビュー含む）は
  // 正規ドメインへリダイレクト
  if (host !== CANONICAL_HOST && host !== `www.${CANONICAL_HOST}`) {
    const url = request.nextUrl.clone();
    url.host = CANONICAL_HOST;
    url.protocol = 'https:';
    url.port = '';

    const response = NextResponse.redirect(url, 308);
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  // 静的ファイル・Next.js内部パス・画像最適化を除外
  matcher: ['/((?!_next/|_vercel/|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)'],
};
