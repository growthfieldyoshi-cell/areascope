import { neon } from '@neondatabase/serverless';
import Link from 'next/link';
import type { Metadata } from 'next';
import PrefFilter from './PrefFilter';

const sql = neon(process.env.DATABASE_URL!);

type Props = { searchParams: Promise<{ pref?: string }> };

async function getLatestYear(): Promise<number> {
  const rows = await sql`SELECT MAX(year) AS year FROM station_passengers`;
  return rows[0]?.year ?? 2021;
}

const metaTitle = '全国駅乗降者数ランキング【最新】｜主要駅TOP100';
const metaDescription = '全国の駅乗降者数ランキングTOP100を掲載。都道府県別の絞り込みや主要駅の比較も確認できます。';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: metaTitle,
    description: metaDescription,
    alternates: { canonical: 'https://areascope.jp/station-ranking' },
    openGraph: {
      type: 'website',
      title: metaTitle,
      description: metaDescription,
      url: 'https://areascope.jp/station-ranking',
      siteName: 'AreaScope',
    },
  };
}

type PrefRow = {
  prefecture_slug: string;
  prefecture_name: string;
};

type RankingRow = {
  station_group_slug: string;
  station_name: string;
  prefecture_name: string;
  municipality_name: string;
  line_name: string;
  operator_name: string;
  passengers: number | null;
};

export default async function StationRankingPage({ searchParams }: Props) {
  const { pref } = await searchParams;

  const year = await getLatestYear();

  const prefRows = (await sql`
    SELECT DISTINCT prefecture_slug, prefecture_name
    FROM stations
    WHERE prefecture_slug IS NOT NULL AND prefecture_name IS NOT NULL
    ORDER BY prefecture_name
  `) as PrefRow[];

  const rows = (await sql`
    SELECT
      s.station_group_slug,
      MAX(s.station_name) AS station_name,
      MAX(s.prefecture_name) AS prefecture_name,
      MAX(s.municipality_name) AS municipality_name,
      MAX(s.line_name) AS line_name,
      MAX(s.operator_name) AS operator_name,
      CAST(SUM(sp.passengers) AS bigint) AS passengers
    FROM stations s
    LEFT JOIN station_passengers sp
      ON s.station_key = sp.station_key
      AND sp.year = ${year}
    WHERE s.station_group_slug IS NOT NULL
      ${pref ? sql`AND s.prefecture_slug = ${pref}` : sql``}
    GROUP BY s.station_group_slug
    ORDER BY passengers DESC NULLS LAST
    LIMIT 100
  `) as RankingRow[];

  const title = pref ? `${pref}の駅乗降者数ランキング` : '全国駅乗降者数ランキング';

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
          全国駅<span style={{ color: '#00d4aa' }}>乗降者数</span>ランキング（{year}年）
        </h1>
        <p style={{ color: '#6b7a99', fontSize: '14px', marginBottom: '32px', lineHeight: 1.7 }}>
          {title}（{year}年）を掲載しています。
        </p>

        <PrefFilter current={pref ?? ''} />

        <div style={{ background: '#111827', borderRadius: '8px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #1e2d45' }}>
                {['順位', '駅名', '路線', '運営会社', '所在地', `乗降者数（${year}年）`, ''].map((h) => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: '#aaa' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
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

        <div style={{ marginTop: '48px' }}>
          <p style={{ fontSize: '12px', fontFamily: 'monospace', color: '#6b7a99', marginBottom: '20px', letterSpacing: '2px' }}>
            // 都道府県別ランキング
          </p>
          <div style={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: '12px', padding: '24px', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#00d4aa', marginBottom: '14px' }}>都道府県別の駅ランキング</h2>
            <p style={{ color: '#aaa', fontSize: '13px', lineHeight: 1.7, marginBottom: '16px' }}>
              都道府県ごとの駅乗降者数ランキングを確認できます。
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {prefRows.map((p) => (
                <Link
                  key={p.prefecture_slug}
                  href={`/station-ranking/${p.prefecture_slug}`}
                  style={{ color: '#e8edf5', textDecoration: 'none', background: '#0a0e1a', border: '1px solid #1e2d45', borderRadius: '4px', padding: '4px 12px', fontSize: '0.85rem' }}
                >
                  {p.prefecture_name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div>
          <p style={{ fontSize: '12px', fontFamily: 'monospace', color: '#6b7a99', marginBottom: '20px', letterSpacing: '2px' }}>
            // ランキングの読み方
          </p>

          <div style={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: '12px', padding: '32px', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#00d4aa', marginBottom: '14px' }}>駅乗降者数ランキングの見方</h2>
            <p style={{ color: '#aaa', fontSize: '14px', lineHeight: 1.8 }}>
              乗降者数とは、1日あたりにその駅で乗車・降車した人数の合計です。国土交通省「国土数値情報」に基づく{year}年の年間データを掲載しています。同じ駅名でも路線が異なる場合は合算して集計しています。
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '20px' }}>
            <div style={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: '12px', padding: '24px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#e8edf5', marginBottom: '10px' }}>上位駅の特徴</h3>
              <p style={{ color: '#6b7a99', fontSize: '13px', lineHeight: 1.7 }}>
                新宿・渋谷・池袋など上位を占めるのは、複数路線が交差するターミナル駅です。乗り換え需要が大きいため、乗降者数が突出して多くなります。商業施設の集積度とも相関しています。
              </p>
            </div>
            <div style={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: '12px', padding: '24px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#e8edf5', marginBottom: '10px' }}>エリア分析への活用</h3>
              <p style={{ color: '#6b7a99', fontSize: '13px', lineHeight: 1.7 }}>
                乗降者数は、その駅周辺の商圏規模を示す指標です。出店検討やエリア比較の際、人口データと合わせて確認することで、集客ポテンシャルをより正確に把握できます。
              </p>
            </div>
          </div>

          <div style={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: '12px', padding: '24px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#e8edf5', marginBottom: '10px' }}>データの留意点</h3>
            <p style={{ color: '#6b7a99', fontSize: '13px', lineHeight: 1.7 }}>
              各駅の詳細ページでは時系列推移を確認でき、コロナ前後の回復度合いや長期トレンドを把握できます。
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
