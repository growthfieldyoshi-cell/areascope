import { neon } from '@neondatabase/serverless';
import { NextRequest, NextResponse } from 'next/server';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.trim();

  if (!query) {
    return NextResponse.json({ municipalities: [] });
  }

  try {
    const municipalities = await sql`
      SELECT DISTINCT
        municipality_code,
        municipality_name,
        prefecture_name,
        prefecture_slug,
        municipality_slug
      FROM stations
      WHERE municipality_slug IS NOT NULL
        AND (
          municipality_name LIKE ${'%' + query + '%'}
          OR prefecture_name LIKE ${'%' + query + '%'}
        )
      ORDER BY prefecture_slug, municipality_name
      LIMIT 30
    `;

    return NextResponse.json({ municipalities });
  } catch (error) {
    return NextResponse.json({ error: 'DB error' }, { status: 500 });
  }
}