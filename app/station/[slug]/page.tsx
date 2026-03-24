import { neon } from '@neondatabase/serverless';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

const sql = neon(process.env.DATABASE_URL!);

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

type StationRow = {
  station_name: string;
  line_name: string;
  operator_name: string;
  slug: string;
  prefecture_name: string;
  municipality_name: string;
  municipality_code: string;
  lat: number | null;
  lng: number | null;
};

type PopulationRow = {
  year: number;
  population: number;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const rows = (await sql`
    SELECT
      s.station_name,
      s.line_name,
      s.prefecture_name,
      s.municipality_name
    FROM stations s
    WHERE s.slug = ${slug}
    LIMIT 1
  `) as {
    station_name: string;
    line_name: string;
    prefecture_name: string;
    municipality_name: string;
  }[];

  const station = rows[0];

  if (!station) {
    return {
      title: '駅が見つかりません｜AreaScope',
      description: '指定された駅ページは存在しません。',
    };
  }

  return {
    title: `${station.station_name}駅（${station.line_name}）｜AreaScope`,
    description: `${station.prefecture_name}${station.municipality_name}にある${station.station_name}駅の人口推移・エリア情報を掲載しています。`,
  };
}

export default async function StationPage({ params }: PageProps) {
  const { slug } = await params;

  const stationRows = (await sql`
    SELECT
      s.station_name,
      s.line_name,
      s.operator_name,
      s.slug,
      s.prefecture_name,
      s.municipality_name,
      s.municipality_code,
      s.lat,
      s.lng
    FROM stations s
    WHERE s.slug = ${slug}
    LIMIT 1
  `) as StationRow[];

  const station = stationRows[0];

  if (!station) {
    notFound();
  }

  const populationRows = (await sql`
    SELECT
      mp.year,
      mp.population
    FROM municipality_populations mp
    WHERE mp.municipality_code = ${station.municipality_code}
    ORDER BY mp.year ASC
  `) as PopulationRow[];

  return (
    <main style={{ maxWidth: '960px', margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ marginBottom: '16px' }}>
        <Link href="/station-ranking" style={{ textDecoration: 'none' }}>
          ← 駅一覧に戻る
        </Link>
      </div>

      <h1 style={{ fontSize: '32px', marginBottom: '12px' }}>
        {station.station_name}駅
      </h1>

      <div style={{ lineHeight: 1.9, marginBottom: '28px' }}>
        <div><strong>路線:</strong> {station.line_name}</div>
        <div><strong>運営会社:</strong> {station.operator_name}</div>
        <div><strong>所在地:</strong> {station.prefecture_name}{station.municipality_name}</div>
        <div><strong>緯度:</strong> {station.lat ?? '-'}</div>
        <div><strong>経度:</strong> {station.lng ?? '-'}</div>
      </div>

      <section>
        <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>
          自治体の人口推移
        </h2>

        {populationRows.length === 0 ? (
          <p>人口データがありません。</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>年</th>
                <th style={thStyle}>人口</th>
              </tr>
            </thead>
            <tbody>
              {populationRows.map((row) => (
                <tr key={row.year}>
                  <td style={tdStyle}>{row.year}</td>
                  <td style={tdStyle}>{row.population.toLocaleString()}人</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  borderBottom: '1px solid #ccc',
  padding: '10px 8px',
  fontWeight: 700,
};

const tdStyle: React.CSSProperties = {
  borderBottom: '1px solid #eee',
  padding: '10px 8px',
  verticalAlign: 'top',
};