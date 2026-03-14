import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL!);

export type Station = {
  id: number;
  station_name: string;
  line_name: string;
  operator_name: string;
  prefecture_name: string;
  municipality_name: string;
  slug: string;
  lat: number | null;
  lng: number | null;
  passengers_2021: number | null;
};

export async function getStationBySlug(slug: string): Promise<Station | null> {
  const rows = await sql`
    SELECT *
    FROM stations_v2
    WHERE slug = ${slug}
    LIMIT 1
  `;
  return (rows[0] as Station) ?? null;
}

export async function getNationalRank(passengers2021: number): Promise<number> {
  const rows = await sql`
    SELECT COUNT(*) as cnt
    FROM stations_v2
    WHERE passengers_2021 > ${passengers2021}
  `;
  return Number(rows[0].cnt) + 1;
}

export async function getPrefectureRank(
  prefecture: string,
  passengers2021: number
): Promise<number> {
  const rows = await sql`
    SELECT COUNT(*) as cnt
    FROM stations_v2
    WHERE prefecture_name = ${prefecture}
      AND passengers_2021 > ${passengers2021}
  `;
  return Number(rows[0].cnt) + 1;
}

export async function getTopStationsInPrefecture(
  prefecture: string,
  excludeSlug: string
): Promise<Station[]> {
  const rows = await sql`
    SELECT *
    FROM stations_v2
    WHERE prefecture_name = ${prefecture}
      AND slug != ${excludeSlug}
    ORDER BY passengers_2021 DESC NULLS LAST
    LIMIT 4
  `;
  return rows as Station[];
}