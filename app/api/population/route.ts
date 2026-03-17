import { neon } from '@neondatabase/serverless';
import { NextRequest, NextResponse } from 'next/server';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cityCode = searchParams.get('cityCode');

  if (!cityCode) {
    return NextResponse.json({ error: 'cityCode required' }, { status: 400 });
  }

  try {
    const rows = await sql`
      SELECT year, population
      FROM municipality_populations
      WHERE municipality_code = ${cityCode}
      ORDER BY year ASC
    `;

    const popData = rows.map((r) => ({
      year: Number(r.year),
      population: Number(r.population),
    }));

    return NextResponse.json({ popData });
  } catch (error) {
    return NextResponse.json({ error: 'DB error' }, { status: 500 });
  }
}