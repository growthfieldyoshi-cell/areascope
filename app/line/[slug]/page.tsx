import { neon } from '@neondatabase/serverless';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

const sql = neon(process.env.DATABASE_URL!);
const BASE_URL = 'https://areascope.jp';

const LINE_MAP: Record<string, string> = {
  yamanote: '山手線',
  chuo: '中央線',
  toyoko: '東横線',
  'keio-inokashira': '京王井の頭線',
  keio: '京王線',
  odakyu: '小田急線',
  tokaido: '東海道線',
  sobu: '総武線',
  saikyo: '埼京線',
  marunouchi: '丸ノ内線',
  hibiya: '日比谷線',
  ginza: '銀座線',
  hanzomon: '半蔵門線',
  fukutoshin: '副都心線',
  namboku: '南北線',
  chiyoda: '千代田線',
  yurakucho: '有楽町線',
  tozai: '東西線',
  mita: '三田線',
  shinjuku: '新宿線',
  asakusa: '浅草線',
  oedo: '大江戸線',
};

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const lineName = LINE_MAP[slug];
  if (!lineName) return { title: '路線が見つかりません｜AreaScope' };
  return {
    title: `${lineName} 駅一覧・乗降者数データ｜AreaScope`,
    description: `${lineName}の駅一覧と乗降者数データを掲載しています。`,
    alternates: { canonical: `${BASE_URL}/line/${slug}` },
    robots: { index: true, follow: true },
  };
}

export default async function LineDetailPage({ params }: Props) {
  const { slug } = await params;
  const lineName = LINE_MAP[slug];
  if (!lineName) notFound();

  const stations = await sql`
    SELECT DISTINCT ON (s.station_group_slug)
      s.station_name,
      s.prefecture_name,
      s.municipality_name,
      s.station_group_slug,
      sp.passengers_2021
    FROM stations s
    LEFT JOIN station_passengers sp
      ON s.station_group_slug = sp.station_group_slug
      AND sp.year = 2021
    WHERE s.line_name ILIKE ${'%' + lineName + '%'}
      AND s.station_group_slug IS NOT NULL
      AND s.station_group_slug ~ '^[a-z0-9][a-z0-9\\-]*$'
    ORDER BY s.station_group_slug, sp.passengers_2021 DESC NULLS LAST
  `;

  if (stations.length === 0) notFound();

  return (
    <main style={{ background: '#0a0e1a', minHeight: '100vh', color: '#e8edf5', padding: '2rem', fontFamily: 'sans-serif', maxWidth: '960px', margin: '0 auto' }}>
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
        {lineName}の駅一覧です。各駅の乗降者数データを確認できます。
      </p>

      <section style={{ marginBottom: '2rem' }}>
        <div style={{ background: '#111827', borderRadius: '8px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #1e2d45' }}>
                {['駅名', '都道府県', '自治体', '乗降者数（2021年）', ''].map((h) => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: '#aaa' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stations.map((s) => (
                <tr key={s.station_group_slug} style={{ borderBottom: '1px solid #1e2d45' }}>
                  <td style={{ padding: '10px 16px', fontWeight: 'bold' }}>
                    <Link href={`/station/${s.station_group_slug}`} style={{ color: '#e8edf5', textDecoration: 'none' }}>
                      {s.station_name}駅
                    </Link>
                  </td>
                  <td style={{ padding: '10px 16px', color: '#aaa' }}>{s.prefecture_name}</td>
                  <td style={{ padding: '10px 16px', color: '#aaa' }}>{s.municipality_name}</td>
                  <td style={{ padding: '10px 16px' }}>
                    {s.passengers_2021 ? `${Number(s.passengers_2021).toLocaleString()}人` : '-'}
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    <Link href={`/station/${s.station_group_slug}`} style={{ color: '#00d4aa', textDecoration: 'none', fontSize: '0.85rem', border: '1px solid #00d4aa', borderRadius: '4px', padding: '4px 10px' }}>
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
        <Link href={`/line/${slug}/ranking`} style={{ color: '#00d4aa', textDecoration: 'none', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', fontSize: '0.9rem' }}>
          🏆 {lineName} 人口ランキングを見る
        </Link>
        <Link href="/line" style={{ color: '#6b7a99', textDecoration: 'none', border: '1px solid #1e2d45', borderRadius: '6px', padding: '10px 20px', fontSize: '0.9rem' }}>
          ← 路線一覧に戻る
        </Link>
      </section>
    </main>
  );
}