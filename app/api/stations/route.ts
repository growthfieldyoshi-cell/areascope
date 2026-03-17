import { neon } from '@neondatabase/serverless';
import { NextRequest, NextResponse } from 'next/server';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  try {
    if (!query) {
      return NextResponse.json({ stations: [] });
    }

    const stations = await sql`
      SELECT
        slug,
        station_name,
        line_name,
        prefecture_name,
        station_group_slug
      FROM stations
      WHERE station_name LIKE ${'%' + query + '%'}
        AND station_group_slug IS NOT NULL
      ORDER BY
        CASE
          WHEN station_name = ${query} THEN 0
          WHEN station_name LIKE ${query + '%'} THEN 1
          ELSE 2
        END,
        station_name,
        line_name
      LIMIT 50
    `;

    return NextResponse.json({ stations });
  } catch (error) {
    return NextResponse.json({ error: 'DB error' }, { status: 500 });
  }
}