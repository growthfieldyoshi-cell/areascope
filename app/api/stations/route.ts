import { neon } from '@neondatabase/serverless';
import { NextRequest, NextResponse } from 'next/server';
const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const pref = searchParams.get('pref');

  try {
    let stations;
    if (query) {
      stations = await sql`
        SELECT * FROM stations_v2 
        WHERE station_name LIKE ${'%' + query + '%'}
        ORDER BY station_name
        LIMIT 50
      `;
    } else if (pref) {
      stations = await sql`
        SELECT * FROM stations_v2 
        WHERE prefecture_name = ${pref}
        ORDER BY passengers_2021 DESC NULLS LAST
        LIMIT 100
      `;
    } else {
      stations = await sql`
        SELECT * FROM stations_v2 
        ORDER BY passengers_2021 DESC NULLS LAST
        LIMIT 100
      `;
    }
    return NextResponse.json({ stations });
  } catch (error) {
    return NextResponse.json({ error: 'DB error' }, { status: 500 });
  }
}