import { neon } from '@neondatabase/serverless';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

const sql = neon(process.env.DATABASE_URL!);
const BASE_URL = 'https://areascope.jp';

type Props = { params: Promise<{ slug: string }> };

type LineRow = {
  line_name: string;
};

type StationRow = {
  station_name: string;
  prefecture_name: string;
  municipality_name: string;
  station_group_slug: string;
  passengers: number | null;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const rows = await sql`
    SELECT DISTINCT line_name
    FROM stations
    WHERE line_slug = ${slug}
    LIMIT 1
  `;
  const lineName = rows[0]?.line_name as string | undefined;

  if (!lineName) {
    return { title: '路線が見つかりません｜AreaScope' };
  }

  return {
    title: `${lineName}の駅一覧・乗降者数ランキング｜AreaScope`,
    description: `${lineName}の駅一覧と乗降者数データを掲載しています。各駅の人の流れを比較することで、路線全体の特徴を把握できます。`,
    alternates: { canonical: `${BASE_URL}/line/${slug}` },
    robots: { index: true, follow: true },
  };
}

export default async function LineDetailPage({ params }: Props) {
  const { slug } = await params;

  const lineRows = await sql`
    SELECT DISTINCT line_name
    FROM stations
    WHERE line_slug = ${slug}
    LIMIT 1
  `;
  const lineName = lineRows[0]?.line_name as string | undefined;

  if (!lineName) notFound();

  const stations = (await sql`
    SELECT
      s.station_group_slug,
      MAX(s.station_name) AS station_name,
      MAX(s.prefecture_name) AS prefecture_name,
      MAX(s.municipality_name) AS municipality_name,
      CAST(SUM(sp.passengers) AS bigint) AS passengers
    FROM stations s
    LEFT JOIN station_passengers sp
      ON s.station_key = sp.station_key
      AND sp.year = 2021
    WHERE s.line_slug = ${slug}
      AND s.station_group_slug IS NOT NULL
      AND s.station_group_slug ~ '^[a-z0-9][a-z0-9\\-]*$'
    GROUP BY s.station_group_slug
    ORDER BY passengers DESC NULLS LAST, station_name ASC
  `) as StationRow[];

  if (stations.length === 0) notFound();

  return (
    <main
      style={{
        background: '#0a0e1a',
        minHeight: '100vh',
        color: '#e8edf5',
        padding: '2rem',
        fontFamily: 'sans-serif',
        maxWidth: '960px',
        margin: '0 auto',
      }}
    >
      <nav style={{ marginBottom: '1.5rem', fontSize: '0.85rem', color: '#6b7a99' }}>
        <Link href="/" style={{ color: '#6b7a99', textDecoration: 'none' }}>トップ</Link>
        {' / '}
        <Link href="/line" style={{ color: '#6b7a99', textDecoration: 'none' }}>路線一覧</Link>
        {' / '}
        <span style={{ color: '#e8edf5' }}>{lineName}</span>
      </nav>

      <h1 style={{ fontSize: '1.8rem', color: '#00d4aa', marginBottom: '0.5rem' }}>
        {lineName} 駅一覧
      </h1>

      <p style={{ color: '#aaa', marginBottom: '2rem', fontSize: '0.95rem', lineHeight: '1.8' }}>
        {lineName}に属する駅一覧と乗降者数データを掲載しています。
        各駅の人の流れを比較することで、路線全体の特徴を把握できます。
      </p>

      <section style={{ marginBottom: '2rem' }}>
        <div style={{ background: '#111827', borderRadius: '8px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #1e2d45' }}>
                {['駅名', '都道府県', '自治体', '乗降者数（2021年）', ''].map((h) => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: '#aaa' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stations.map((s) => (
                <tr key={s.station_group_slug} style={{ borderBottom: '1px solid #1e2d45' }}>
                  <td style={{ padding: '10px 16px', fontWeight: 'bold' }}>
                    <Link
                      href={`/station/${s.station_group_slug}`}
                      style={{ color: '#e8edf5', textDecoration: 'none' }}
                    >
                      {s.station_name}駅
                    </Link>
                  </td>
                  <td style={{ padding: '10px 16px', color: '#aaa' }}>{s.prefecture_name}</td>
                  <td style={{ padding: '10px 16px', color: '#aaa' }}>{s.municipality_name}</td>
                  <td style={{ padding: '10px 16px' }}>
                    {s.passengers ? `${Number(s.passengers).toLocaleString()}人` : '-'}
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    <Link
                      href={`/station/${s.station_group_slug}`}
                      style={{
                        color: '#00d4aa',
                        textDecoration: 'none',
                        fontSize: '0.85rem',
                        border: '1px solid #00d4aa',
                        borderRadius: '4px',
                        padding: '4px 10px',
                      }}
                    >
                      詳細
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <Link
          href="/station-ranking"
          style={{
            color: '#00d4aa',
            textDecoration: 'none',
            border: '1px solid #00d4aa',
            borderRadius: '6px',
            padding: '10px 20px',
            fontSize: '0.9rem',
          }}
        >
          🏆 全国駅乗降者数ランキング
        </Link>
        <Link
          href="/line"
          style={{
            color: '#6b7a99',
            textDecoration: 'none',
            border: '1px solid #1e2d45',
            borderRadius: '6px',
            padding: '10px 20px',
            fontSize: '0.9rem',
          }}
        >
          ← 路線一覧に戻る
        </Link>
      </section>
    </main>
  );
}