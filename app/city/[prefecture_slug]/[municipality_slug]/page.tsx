import { neon } from '@neondatabase/serverless';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Breadcrumb from '@/components/Breadcrumb';

const sql = neon(process.env.DATABASE_URL!);
const BASE_URL = 'https://areascope.jp';
const OG_IMAGE = 'https://areascope.jp/og-default.jpg';

type Props = {
  params: Promise<{ prefecture_slug: string; municipality_slug: string }>;
};

type StationRow = {
  station_name: string;
  station_group_slug: string;
  passengers: number | null;
};

type PopulationRow = {
  year: number;
  population: number;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { prefecture_slug, municipality_slug } = await params;
  const rows = await sql`
    SELECT DISTINCT municipality_name, prefecture_name FROM stations
    WHERE prefecture_slug = ${prefecture_slug} AND municipality_slug = ${municipality_slug} LIMIT 1
  `;
  if (!rows[0]) return { title: '自治体が見つかりません｜AreaScope' };
  const { municipality_name, prefecture_name } = rows[0];
  const title = `${prefecture_name}${municipality_name}の駅一覧・人口推移｜AreaScope`;
  const description = `${prefecture_name}${municipality_name}の駅一覧、主要駅の乗降者数、人口推移を掲載しています。`;
  return {
    title, description,
    alternates: { canonical: `${BASE_URL}/city/${prefecture_slug}/${municipality_slug}` },
    openGraph: { type: 'website', title, description, url: `${BASE_URL}/city/${prefecture_slug}/${municipality_slug}`, siteName: 'AreaScope', images: [{ url: OG_IMAGE }] },
    twitter: { card: 'summary_large_image', title, description, images: [OG_IMAGE] },
    robots: { index: true, follow: true },
  };
}

export default async function CityPage({ params }: Props) {
  const { prefecture_slug, municipality_slug } = await params;

  const infoRows = await sql`
    SELECT DISTINCT municipality_name, prefecture_name FROM stations
    WHERE prefecture_slug = ${prefecture_slug} AND municipality_slug = ${municipality_slug} LIMIT 1
  `;
  if (!infoRows[0]) notFound();
  const { municipality_name, prefecture_name } = infoRows[0];

  const stationRows = (await sql`
    WITH grouped AS (
      SELECT DISTINCT ON (s.station_group_slug)
        s.station_name, s.station_group_slug
      FROM stations s
      WHERE s.prefecture_slug = ${prefecture_slug} AND s.municipality_slug = ${municipality_slug}
        AND s.station_group_slug IS NOT NULL
      ORDER BY s.station_group_slug, s.station_name
    )
    SELECT
      g.station_name, g.station_group_slug,
      CAST(SUM(sp.passengers) AS bigint) AS passengers
    FROM grouped g
    LEFT JOIN stations s ON s.station_group_slug = g.station_group_slug
      AND s.prefecture_slug = ${prefecture_slug} AND s.municipality_slug = ${municipality_slug}
    LEFT JOIN station_passengers sp ON sp.station_key = s.station_key AND sp.year = 2021
    GROUP BY g.station_name, g.station_group_slug
    ORDER BY passengers DESC NULLS LAST, g.station_name ASC
  `) as StationRow[];

  if (stationRows.length === 0) notFound();

  const populationRows = (await sql`
    SELECT mp.year, SUM(mp.population) AS population
    FROM municipality_populations mp
    WHERE mp.municipality_code IN (
      SELECT DISTINCT municipality_code FROM stations
      WHERE prefecture_slug = ${prefecture_slug} AND municipality_slug = ${municipality_slug}
    )
    GROUP BY mp.year ORDER BY mp.year ASC
  `) as PopulationRow[];

  return (
    <main style={{ background: '#0a0e1a', minHeight: '100vh', color: '#e8edf5', padding: '2rem', fontFamily: 'sans-serif', maxWidth: '960px', margin: '0 auto' }}>
      <style>{`
        .city-table-wrap { overflow-x: auto; }
        .city-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
        .city-table th { padding: 10px 16px; text-align: left; color: #aaa; }
        .city-table td { padding: 10px 16px; border-bottom: 1px solid #1e2d45; }
        .city-cards { display: none; }
        .city-card { background: #111827; border: 1px solid #1e2d45; border-radius: 8px; padding: 14px 16px; margin-bottom: 10px; }
        .city-card-top { display: flex; align-items: center; gap: 12px; margin-bottom: 4px; }
        .city-card-rank { font-family: monospace; font-size: 13px; color: #6b7a99; min-width: 32px; }
        .city-card-rank.top3 { color: #00d4aa; font-weight: bold; }
        .city-card-name { font-size: 15px; font-weight: 700; flex: 1; }
        .city-card-btn { color: #00d4aa; text-decoration: none; font-size: 12px; border: 1px solid #00d4aa; border-radius: 4px; padding: 4px 10px; white-space: nowrap; }
        .city-card-passengers { font-size: 12px; color: #aaa; margin-top: 4px; }
        @media (max-width: 640px) {
          .city-table-wrap { display: none; }
          .city-cards { display: block; }
        }
      `}</style>

      <Breadcrumb items={[
        { label: 'TOP', href: '/' },
        { label: prefecture_name, href: `/prefecture/${prefecture_slug}` },
        { label: municipality_name },
      ]} />

      <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>
        {prefecture_name}<span style={{ color: '#00d4aa' }}>{municipality_name}</span>の駅一覧
      </h1>
      <p style={{ color: '#aaa', marginBottom: '2rem', fontSize: '0.95rem', lineHeight: 1.8 }}>
        {prefecture_name}{municipality_name}内の全{stationRows.length}駅を掲載しています。乗降者数（2021年）をもとに並べています。
      </p>

      {/* 駅一覧 */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.3rem', color: '#00d4aa', marginBottom: '1rem' }}>
          駅一覧（全{stationRows.length}駅）
        </h2>

        {/* PC */}
        <div style={{ background: '#111827', borderRadius: '8px' }}>
          <div className="city-table-wrap">
            <table className="city-table">
              <thead>
                <tr style={{ borderBottom: '2px solid #1e2d45' }}>
                  {['順位', '駅名', '乗降者数（2021年）', ''].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stationRows.map((r, i) => (
                  <tr key={r.station_group_slug}>
                    <td style={{ color: i < 3 ? '#00d4aa' : '#aaa', fontWeight: i < 3 ? 'bold' : 'normal' }}>{i + 1}位</td>
                    <td style={{ fontWeight: 'bold' }}>
                      <Link href={`/station/${r.station_group_slug}`} style={{ color: '#e8edf5', textDecoration: 'none' }}>{r.station_name}駅</Link>
                    </td>
                    <td>{r.passengers != null ? `${Number(r.passengers).toLocaleString()}人` : 'データなし'}</td>
                    <td>
                      <Link href={`/station/${r.station_group_slug}`} style={{ color: '#00d4aa', textDecoration: 'none', fontSize: '0.85rem', border: '1px solid #00d4aa', borderRadius: '4px', padding: '4px 10px' }}>詳細</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* スマホ */}
        <div className="city-cards">
          {stationRows.map((r, i) => (
            <div key={r.station_group_slug} className="city-card">
              <div className="city-card-top">
                <div className={`city-card-rank ${i < 3 ? 'top3' : ''}`}>{i + 1}位</div>
                <div className="city-card-name">
                  <Link href={`/station/${r.station_group_slug}`} style={{ textDecoration: 'none', color: '#e8edf5' }}>{r.station_name}駅</Link>
                </div>
                <Link href={`/station/${r.station_group_slug}`} className="city-card-btn">詳細</Link>
              </div>
              <div className="city-card-passengers">
                乗降者数: {r.passengers != null ? `${Number(r.passengers).toLocaleString()}人` : 'データなし'}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 人口推移 */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.3rem', color: '#00d4aa', marginBottom: '1rem' }}>人口推移</h2>
        {populationRows.length === 0 ? (
          <p style={{ color: '#aaa' }}>人口データがありません。</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', minWidth: '320px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #1e2d45' }}>
                  {['年', '人口'].map(h => (
                    <th key={h} style={{ padding: '10px 8px', textAlign: 'left', color: '#aaa' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {populationRows.map(row => (
                  <tr key={row.year} style={{ borderBottom: '1px solid #1e2d45' }}>
                    <td style={{ padding: '10px 8px' }}>{row.year}</td>
                    <td style={{ padding: '10px 8px' }}>{Number(row.population).toLocaleString()}人</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 関連ページ */}
      <section>
        <h2 style={{ fontSize: '1.3rem', color: '#00d4aa', marginBottom: '1rem' }}>関連ページ</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href={`/prefecture/${prefecture_slug}`} style={{ color: '#00d4aa', textDecoration: 'none', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', fontSize: '0.9rem' }}>
            🗾 {prefecture_name}の駅一覧
          </Link>
          <Link href="/station-ranking" style={{ color: '#00d4aa', textDecoration: 'none', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', fontSize: '0.9rem' }}>
            🏆 全国駅ランキング
          </Link>
        </div>
      </section>
    </main>
  );
}