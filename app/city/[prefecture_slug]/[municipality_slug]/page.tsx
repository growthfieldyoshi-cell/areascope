import { neon } from '@neondatabase/serverless';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Breadcrumb from '@/components/Breadcrumb';

const sql = neon(process.env.DATABASE_URL!);
const BASE_URL = 'https://areascope.jp';
const OG_IMAGE = 'https://areascope.jp/og-default.jpg';

async function getLatestYear(): Promise<number> {
  const rows = await sql`SELECT MAX(year) AS year FROM station_passengers`;
  return rows[0]?.year ?? 2021;
}

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
  population: number | string;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { prefecture_slug, municipality_slug } = await params;
  const rows = await sql`
    SELECT DISTINCT municipality_name, prefecture_name FROM stations
    WHERE prefecture_slug = ${prefecture_slug} AND municipality_slug = ${municipality_slug} LIMIT 1
  `;
  if (!rows[0]) return { title: '自治体が見つかりません｜AreaScope' };
  const { municipality_name, prefecture_name } = rows[0];
  const title = `${municipality_name}の主要駅一覧｜乗降者数ランキング・人口推移`;
  const description = `${prefecture_name}${municipality_name}の主要駅一覧と乗降者数ランキングを掲載。人口推移や増減率もグラフで確認できます。`;
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

  const year = await getLatestYear();

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
    LEFT JOIN station_passengers sp ON sp.station_key = s.station_key AND sp.year = ${year}
    GROUP BY g.station_name, g.station_group_slug
    ORDER BY passengers DESC NULLS LAST, g.station_name ASC
  `) as StationRow[];

  const populationRows = (await sql`
    SELECT mp.year, SUM(mp.population) AS population
    FROM municipality_populations mp
    WHERE mp.municipality_code IN (
      SELECT DISTINCT municipality_code FROM stations
      WHERE prefecture_slug = ${prefecture_slug} AND municipality_slug = ${municipality_slug}
    )
    GROUP BY mp.year ORDER BY mp.year ASC
  `) as PopulationRow[];

  const popNormalized = populationRows.map(r => ({ year: r.year, population: Number(r.population) }));
  const latestPop = popNormalized.length > 0 ? popNormalized[popNormalized.length - 1] : null;
  const oldestPop = popNormalized.length > 0 ? popNormalized[0] : null;
  const peakPop = popNormalized.length > 0 ? popNormalized.reduce((a, b) => a.population > b.population ? a : b) : null;
  const changeRate = latestPop && oldestPop && oldestPop.population > 0
    ? (((latestPop.population - oldestPop.population) / oldestPop.population) * 100).toFixed(1)
    : null;
  const maxPop = popNormalized.length > 0 ? Math.max(...popNormalized.map(r => r.population)) : 1;
  const topStation = stationRows[0];

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
        .kpi { background: #111827; border: 1px solid #1e2d45; border-radius: 12px; padding: 16px 20px; }
        @media (max-width: 640px) {
          .city-table-wrap { display: none; }
          .city-cards { display: block; }
          .kpi-grid { grid-template-columns: 1fr 1fr !important; }
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
        {prefecture_name}{municipality_name}には主要駅が{stationRows.length}駅あります。
        {topStation?.passengers != null && (
          <>最多利用駅は<Link href={`/station/${topStation.station_group_slug}`} style={{ color: '#00d4aa', textDecoration: 'none' }}>{topStation.station_name}駅</Link>で、{year}年の乗降者数は{Number(topStation.passengers).toLocaleString()}人です。</>
        )}
        乗降者数と人口推移をあわせて確認できます。
      </p>

      {/* データ分析セクション */}
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.2rem', color: '#00d4aa', marginBottom: '12px' }}>
          {prefecture_name}{municipality_name}のデータ分析
        </h2>
        <p style={{ color: '#aaa', fontSize: '0.95rem', lineHeight: 1.8, marginBottom: '12px' }}>
          {prefecture_name}{municipality_name}の人口は
          <strong style={{ color: '#e8edf5' }}>{latestPop?.population.toLocaleString() ?? 'データなし'}人</strong>
          で、{oldestPop?.year}年から{latestPop?.year}年にかけて
          <strong style={{ color: '#e8edf5' }}>
            {changeRate ? `${parseFloat(changeRate) >= 0 ? '増加' : '減少'}（${changeRate}%）` : '大きな変動は確認できません'}
          </strong>
          。
        </p>
        <p style={{ color: '#aaa', fontSize: '0.95rem', lineHeight: 1.8 }}>
          主要駅の乗降者数と人口推移をあわせて見ることで、
          居住規模と人の流れの両面からエリアの特徴を把握できます。
        </p>
      </section>

      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.3rem', color: '#00d4aa', marginBottom: '1rem' }}>人口推移・増減率</h2>
        {popNormalized.length === 0 ? (
          <p style={{ color: '#aaa' }}>人口データがありません。</p>
        ) : (
          <>
            <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
              <div className="kpi">
                <div style={{ fontSize: '11px', color: '#6b7a99', fontFamily: 'monospace', marginBottom: '8px' }}>最新人口（{latestPop?.year}年）</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#00d4aa' }}>{latestPop?.population.toLocaleString()}</div>
                <div style={{ fontSize: '11px', color: '#6b7a99' }}>人</div>
              </div>
              <div className="kpi">
                <div style={{ fontSize: '11px', color: '#6b7a99', fontFamily: 'monospace', marginBottom: '8px' }}>人口ピーク年</div>
                <div style={{ fontSize: '24px', fontWeight: 800 }}>{peakPop?.year}年</div>
                <div style={{ fontSize: '11px', color: '#6b7a99' }}>{peakPop?.population.toLocaleString()}人</div>
              </div>
              <div className="kpi">
                <div style={{ fontSize: '11px', color: '#6b7a99', fontFamily: 'monospace', marginBottom: '8px' }}>長期変化（{oldestPop?.year}年比）</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: parseFloat(changeRate || '0') >= 0 ? '#00d4aa' : '#ff4757' }}>
                  {parseFloat(changeRate || '0') >= 0 ? '▲' : '▼'}{Math.abs(parseFloat(changeRate || '0'))}%
                </div>
                <div style={{ fontSize: '11px', color: '#6b7a99' }}>{oldestPop?.population.toLocaleString()} → {latestPop?.population.toLocaleString()}人</div>
              </div>
            </div>

            <div style={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: '12px', padding: '24px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '16px' }}>
                人口推移グラフ
                <span style={{ fontSize: '11px', color: '#6b7a99', fontFamily: 'monospace', marginLeft: '12px' }}>1995〜2020年 国勢調査</span>
              </div>
              {popNormalized.map(row => {
                const pct = maxPop > 0 ? (row.population / maxPop) * 100 : 0;
                return (
                  <div key={row.year} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#6b7a99', width: '40px', textAlign: 'right' }}>{row.year}</div>
                    <div style={{ flex: 1, background: '#1e2d45', borderRadius: '4px', height: '28px' }}>
                      <div style={{ width: `${pct}%`, background: '#00d4aa', borderRadius: '4px', height: '28px', display: 'flex', alignItems: 'center', paddingLeft: '8px', fontSize: '11px', fontFamily: 'monospace', color: '#0a0e1a', fontWeight: 700, minWidth: pct > 0 ? '80px' : '0', overflow: 'hidden' }}>
                        {row.population.toLocaleString()}人
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </section>

      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.3rem', color: '#00d4aa', marginBottom: '0.5rem' }}>
          主要駅ランキング（全{stationRows.length}駅）
        </h2>
        <p style={{ fontSize: '13px', color: '#6b7a99', marginBottom: '1rem' }}>乗降者数（{year}年）順に並べています。</p>

        {stationRows.length === 0 ? (
          <p style={{ color: '#aaa' }}>駅データがありません。</p>
        ) : (
          <>
            <div style={{ background: '#111827', borderRadius: '8px' }}>
              <div className="city-table-wrap">
                <table className="city-table">
                  <thead>
                    <tr style={{ borderBottom: '2px solid #1e2d45' }}>
                      {['順位', '駅名', `乗降者数（${year}年）`, ''].map(h => (
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
          </>
        )}
      </section>

      <section>
        <h2 style={{ fontSize: '1.3rem', color: '#00d4aa', marginBottom: '1rem' }}>関連ページ</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/station-ranking" style={{ color: '#00d4aa', textDecoration: 'none', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', fontSize: '0.9rem' }}>
            🏆 全国駅ランキング
          </Link>
          <Link href={`/prefecture/${prefecture_slug}`} style={{ color: '#00d4aa', textDecoration: 'none', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', fontSize: '0.9rem' }}>
            🗾 {prefecture_name}のエリア分析
          </Link>
          <Link href="/city" style={{ color: '#6b7a99', textDecoration: 'none', border: '1px solid #1e2d45', borderRadius: '6px', padding: '10px 20px', fontSize: '0.9rem' }}>
            🏙️ 市区町村一覧
          </Link>
        </div>
      </section>
    </main>
  );
}