import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export type Station = {
  id: number;
  station_name: string;
  line_name: string;
  prefecture: string;
  romanized_name: string;
  slug: string;
  passengers_2011: number | null;
  passengers_2012: number | null;
  passengers_2013: number | null;
  passengers_2014: number | null;
  passengers_2015: number | null;
  passengers_2016: number | null;
  passengers_2017: number | null;
  passengers_2018: number | null;
  passengers_2019: number | null;
  passengers_2020: number | null;
  passengers_2021: number | null;
};

export async function getStationBySlug(slug: string): Promise<Station | null> {
  const rows = await sql`
    SELECT *
    FROM stations
    WHERE slug = ${slug}
    LIMIT 1
  `;
  return (rows[0] as Station) ?? null;
}

export async function getNationalRank(passengers2021: number): Promise<number> {
  const rows = await sql`
    SELECT COUNT(*) as cnt
    FROM stations
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
    FROM stations
    WHERE prefecture = ${prefecture}
      AND passengers_2021 > ${passengers2021}
  `;
  return Number(rows[0].cnt) + 1;
}

export async function getTopStationsInPrefecture(
  prefecture: string,
  excludeId: number
): Promise<Station[]> {
  const rows = await sql`
    SELECT *
    FROM stations
    WHERE prefecture = ${prefecture}
      AND id != ${excludeId}
    ORDER BY passengers_2021 DESC NULLS LAST
    LIMIT 4
  `;
  return rows as Station[];
}