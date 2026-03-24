import { neon } from '@neondatabase/serverless';
import Link from 'next/link';
import type { Metadata } from 'next';

const sql = neon(process.env.DATABASE_URL!);

export const metadata: Metadata = {
  title: '全国駅乗降者数ランキング｜AreaScope',
  description: '日本全国の駅乗降者数ランキング。乗降者数順で主要駅を比較できます。',
  alternates: { canonical: 'https://areascope.jp/station-ranking' },
};

type RankingRow = {
  station_name: string;
  line_name: string;
  operator_name: string;
  station_group_slug: string;
  municipality_name: string;
  prefecture_name: string;
  passengers: number | null;
};

export default async function StationRankingPage() {
  const rows = (await sql`
    SELECT DISTINCT ON (s.station_group_slug)
      s.station_name,
      s.line_name,
      s.operator_name,
      s.station_group_slug,
      s.municipality_name,
      s.prefecture_name,
      sp.passengers
    FROM stations s
    LEFT JOIN station_passengers sp
      ON s.station_key = sp.station_key
      AND sp.year = 2021
    WHERE s.station_group_slug IS NOT NULL
      AND s.station_group_slug ~ '^[a-z0-9][a-z0-9\-]*$'
    ORDER BY s.station_group_slug, sp.passengers DESC NULLS LAST
    LIMIT 100
  `) as RankingRow[];

  const sorted = [...rows].sort((a, b) => (b.passengers ?? 0) - (a.passengers ?? 0));

  return (
    <main style={{ background: '#0a0e1a', minHeight: '100vh', color: '#e8edf5', fontFamily: "'Noto Sans JP', sans-serif" }}>
      <header style={{ padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1e2d45', background: 'rgba(10,14,26,0.95)' }}>
        <Link href="/" style={{ fontSize: '22px', fontWeight: 800, textDecoration: 'none', color: '#e8edf5' }}>
          AREA<span style={{ color: '#00d4aa' }}>SCOPE</span>
        </Link>
      </header>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#00d4aa', letterSpacing: '3px', marginBottom: '12px' }}>// 全国ランキング</div>
        <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '8px' }}>
          全国駅<span style={{ color: '#00d4aa' }}>乗降者数</span>ランキング
        </h1>
        <p style={{ color: '#6b7a99', fontSize: '14px', marginBottom: '32px', lineHeight: 1.7 }}>
          全国の駅を乗降者数（2021年）順に掲載しています。
        </p>

        <div style={{ background: '#111827', borderRadius: '8px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #1e2d45' }}>
                {['順位', '駅名', '路線', '運営会社', '所在地', '乗降者数（2021年）', ''].map((h) => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: '#aaa' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((row, index) => (
                <tr key={row.station_group_slug} style={{ borderBottom: '1px solid #1e2d45' }}>
                  <td style={{ padding: '10px 16px', color: index < 3 ? '#00d4aa' : '#aaa', fontWeight: index < 3 ? 'bold' : 'normal' }}>
                    {index + 1}位
                  </td>
                  <td style={{ padding: '10px 16px', fontWeight: 'bold' }}>
                    <Link href={`/station/${row.station_group_slug}`} style={{ color: '#e8edf5', textDecoration: 'none' }}>
                      {row.station_name}駅
                    </Link>
                  </td>
                  <td style={{ padding: '10px 16px', color: '#aaa' }}>{row.line_name}</td>
                  <td style={{ padding: '10px 16px', color: '#aaa' }}>{row.operator_name}</td>
                  <td style={{ padding: '10px 16px', color: '#aaa' }}>{row.prefecture_name}{row.municipality_name}</td>
                  <td style={{ padding: '10px 16px' }}>
                    {row.passengers ? `${Number(row.passengers).toLocaleString()}人` : '-'}
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    <Link href={`/station/${row.station_group_slug}`} style={{ color: '#00d4aa', textDecoration: 'none', fontSize: '0.85rem', border: '1px solid #00d4aa', borderRadius: '4px', padding: '4px 10px' }}>
                      詳細
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}