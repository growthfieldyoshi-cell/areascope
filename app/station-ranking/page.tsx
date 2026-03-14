import { neon } from '@neondatabase/serverless';
import Link from 'next/link';
import type { Metadata } from 'next';
import Breadcrumb from '@/components/Breadcrumb';

const sql = neon(process.env.DATABASE_URL!);

export const metadata: Metadata = {
  title: '全国駅ランキング｜AreaScope',
  description: '日本全国の駅を2021年乗降者数順にランキング。各駅の路線・人口データを掲載しています。',
};

type RankingRow = {
  station_name: string;
  station_group_slug: string;
  prefecture_name: string;
  municipality_name: string;
  passengers: number | null;
};

export default async function StationRankingPage() {
  const rows = (await sql`
    WITH grouped_stations AS (
      SELECT DISTINCT ON (station_group_slug)
        station_group_slug,
        station_name,
        prefecture_name,
        municipality_name
      FROM stations
      WHERE station_group_slug IS NOT NULL
      ORDER BY station_group_slug, station_name
    )
    SELECT
      gs.station_name,
      gs.station_group_slug,
      gs.prefecture_name,
      gs.municipality_name,
      CAST(SUM(sp.passengers) AS bigint) AS passengers
    FROM grouped_stations gs
    JOIN stations s ON s.station_group_slug = gs.station_group_slug
    JOIN station_passengers sp ON sp.station_key = s.station_key
    WHERE sp.year = 2021
    GROUP BY gs.station_group_slug, gs.station_name, gs.prefecture_name, gs.municipality_name
    ORDER BY passengers DESC NULLS LAST
    LIMIT 100
  `) as RankingRow[];

  return (
    <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px', background: '#0a0e1a', minHeight: '100vh', color: '#e8edf5', fontFamily: 'sans-serif' }}>
      <style>{`
        .ranking-table { width: 100%; border-collapse: collapse; font-size: 14px; }
        .ranking-table th { text-align: left; border-bottom: 2px solid #1e2d45; padding: 10px 8px; color: #aaa; font-weight: 700; }
        .ranking-table td { padding: 10px 8px; border-bottom: 1px solid #1e2d45; }
        .ranking-cards { display: none; }
        .ranking-card { background: #111827; border: 1px solid #1e2d45; border-radius: 8px; padding: 16px; margin-bottom: 12px; display: flex; align-items: center; gap: 16px; }
        .ranking-card-rank { font-family: monospace; font-size: 18px; font-weight: 700; color: #6b7a99; min-width: 36px; text-align: center; }
        .ranking-card-rank.top3 { color: #00d4aa; }
        .ranking-card-body { flex: 1; }
        .ranking-card-name { font-size: 16px; font-weight: 700; margin-bottom: 4px; }
        .ranking-card-meta { font-size: 12px; color: #aaa; margin-bottom: 6px; }
        .ranking-card-passengers { font-size: 14px; color: #00d4aa; font-family: monospace; }
        .ranking-card-btn { color: #00d4aa; text-decoration: none; font-size: 12px; border: 1px solid #00d4aa; border-radius: 4px; padding: 4px 10px; white-space: nowrap; }
        @media (max-width: 640px) {
          .ranking-table-wrap { display: none; }
          .ranking-cards { display: block; }
        }
      `}</style>

      <Breadcrumb items={[
        { label: 'TOP', href: '/' },
        { label: '全国駅ランキング' },
      ]} />

      <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '16px' }}>
        全国駅<span style={{ color: '#00d4aa' }}>ランキング</span>
      </h1>
      <p style={{ marginBottom: '24px', lineHeight: 1.8, color: '#aaa' }}>
        2021年の乗降者数順に掲載しています。
      </p>

      {/* PC表示：テーブル */}
      <div className="ranking-table-wrap">
        <table className="ranking-table">
          <thead>
            <tr>
              {['順位', '駅名', '所在地', '乗降者数（2021年）', ''].map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.station_group_slug}>
                <td style={{ color: '#6b7a99', fontFamily: 'monospace' }}>{index + 1}</td>
                <td style={{ fontWeight: 700 }}>
                  <Link href={`/station/${row.station_group_slug}`} style={{ textDecoration: 'none', color: '#00d4aa' }}>
                    {row.station_name}駅
                  </Link>
                </td>
                <td style={{ color: '#aaa' }}>{row.prefecture_name}{row.municipality_name}</td>
                <td>{row.passengers != null ? `${Number(row.passengers).toLocaleString()}人` : 'データなし'}</td>
                <td>
                  <Link href={`/station/${row.station_group_slug}`} style={{ color: '#00d4aa', textDecoration: 'none', fontSize: '0.85rem', border: '1px solid #00d4aa', borderRadius: '4px', padding: '4px 10px' }}>
                    詳細
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* スマホ表示：カード */}
      <div className="ranking-cards">
        {rows.map((row, index) => (
          <div key={row.station_group_slug} className="ranking-card">
            <div className={`ranking-card-rank ${index < 3 ? 'top3' : ''}`}>
              {index + 1}
            </div>
            <div className="ranking-card-body">
              <div className="ranking-card-name">
                <Link href={`/station/${row.station_group_slug}`} style={{ textDecoration: 'none', color: '#e8edf5' }}>
                  {row.station_name}駅
                </Link>
              </div>
              <div className="ranking-card-meta">{row.prefecture_name}{row.municipality_name}</div>
              <div className="ranking-card-passengers">
                {row.passengers != null ? `${Number(row.passengers).toLocaleString()}人` : 'データなし'}
              </div>
            </div>
            <Link href={`/station/${row.station_group_slug}`} className="ranking-card-btn">
              詳細
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}