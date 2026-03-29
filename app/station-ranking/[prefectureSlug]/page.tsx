import { neon } from '@neondatabase/serverless';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Breadcrumb from '@/components/Breadcrumb';

const sql = neon(process.env.DATABASE_URL!);

type Props = { params: Promise<{ prefectureSlug: string }> };

async function getLatestYear(): Promise<number> {
  const rows = await sql`SELECT MAX(year) AS year FROM station_passengers`;
  return rows[0]?.year ?? 2021;
}

async function getPrefectureName(slug: string): Promise<string | null> {
  const rows = await sql`
    SELECT DISTINCT prefecture_name
    FROM stations
    WHERE prefecture_slug = ${slug}
    LIMIT 1
  `;
  return rows.length > 0 ? rows[0].prefecture_name : null;
}

export async function generateStaticParams() {
  const rows = await sql`
    SELECT DISTINCT prefecture_slug
    FROM stations
    WHERE prefecture_slug IS NOT NULL
  `;
  return rows.map((r) => ({ prefectureSlug: r.prefecture_slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { prefectureSlug } = await params;
  const prefName = await getPrefectureName(prefectureSlug);
  if (!prefName) return {};
  const year = await getLatestYear();
  return {
    title: `${prefName}の駅乗降者数ランキング（${year}年）｜AreaScope`,
    description: `${prefName}の駅別乗降者数ランキング。${year}年のデータをもとに利用者数の多い駅TOP100を掲載。`,
    alternates: { canonical: `https://areascope.jp/station-ranking/${prefectureSlug}` },
  };
}

type RankingRow = {
  station_group_slug: string;
  station_name: string;
  municipality_name: string;
  line_name: string;
  operator_name: string;
  passengers: number | null;
};

export default async function PrefectureStationRankingPage({ params }: Props) {
  const { prefectureSlug } = await params;
  const prefName = await getPrefectureName(prefectureSlug);
  if (!prefName) notFound();

  const year = await getLatestYear();

  const rows = (await sql`
    SELECT
      s.station_group_slug,
      MAX(s.station_name) AS station_name,
      MAX(s.municipality_name) AS municipality_name,
      MAX(s.line_name) AS line_name,
      MAX(s.operator_name) AS operator_name,
      CAST(SUM(sp.passengers) AS bigint) AS passengers
    FROM stations s
    LEFT JOIN station_passengers sp
      ON s.station_key = sp.station_key
      AND sp.year = ${year}
    WHERE s.station_group_slug IS NOT NULL
      AND s.prefecture_slug = ${prefectureSlug}
    GROUP BY s.station_group_slug
    HAVING SUM(sp.passengers) IS NOT NULL
    ORDER BY passengers DESC NULLS LAST
    LIMIT 100
  `) as RankingRow[];

  return (
    <main style={{ background: '#0a0e1a', minHeight: '100vh', color: '#e8edf5', fontFamily: "'Noto Sans JP', sans-serif" }}>
      <header style={{ padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1e2d45', background: 'rgba(10,14,26,0.95)' }}>
        <Link href="/" style={{ fontSize: '22px', fontWeight: 800, textDecoration: 'none', color: '#e8edf5' }}>
          AREA<span style={{ color: '#00d4aa' }}>SCOPE</span>
        </Link>
      </header>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px' }}>
        <Breadcrumb items={[
          { label: 'TOP', href: '/' },
          { label: '全国駅ランキング', href: '/station-ranking' },
          { label: `${prefName}` },
        ]} />

        <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '8px' }}>
          {prefName}の駅<span style={{ color: '#00d4aa' }}>乗降者数</span>ランキング（{year}年）
        </h1>
        <p style={{ color: '#6b7a99', fontSize: '14px', marginBottom: '32px', lineHeight: 1.7 }}>
          {prefName}の駅別乗降者数ランキングです。{year}年のデータをもとに、利用者数の多い駅を掲載しています。
        </p>

        {rows.length === 0 ? (
          <div style={{ background: '#111827', borderRadius: '8px', padding: '40px', textAlign: 'center' }}>
            <p style={{ color: '#6b7a99', fontSize: '14px' }}>
              {prefName}の{year}年乗降者数データはまだ登録されていません。
            </p>
          </div>
        ) : (
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
                    <td style={{ padding: '10px 16px', color: '#aaa' }}>{row.municipality_name}</td>
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
        )}

        <div style={{ marginTop: '32px', textAlign: 'center' }}>
          <Link href="/station-ranking" style={{ color: '#00d4aa', textDecoration: 'none', fontSize: '14px', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', display: 'inline-block' }}>
            全国ランキングを見る
          </Link>
        </div>
      </div>
    </main>
  );
}
