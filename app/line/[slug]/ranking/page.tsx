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
  if (!lineName) return { title: '路線が見つかりません' };
  return {
    title: `${lineName} 駅乗降者数ランキング｜AreaScope`,
    description: `${lineName}の駅乗降者数ランキングを掲載。主要駅の利用者数を比較できます。`,
    alternates: { canonical: `${BASE_URL}/line/${slug}/ranking` },
    robots: { index: true, follow: true },
  };
}

export default async function LineRankingPage({ params }: Props) {
  const { slug } = await params;
  const lineName = LINE_MAP[slug];
  if (!lineName) notFound();

  const rows = await sql`
    SELECT station_name, prefecture, slug, passengers_2021
    FROM stations
    WHERE line_name ILIKE ${'%' + lineName + '%'}
    AND passengers_2021 IS NOT NULL
    ORDER BY passengers_2021 DESC
    LIMIT 50
  `;

  if (rows.length === 0) notFound();

  return (
    <main style={{ background: '#0a0e1a', minHeight: '100vh', color: '#e8edf5', padding: '2rem', fontFamily: 'sans-serif', maxWidth: '960px', margin: '0 auto' }}>

      <h1 style={{ fontSize: '1.8rem', color: '#00d4aa', marginBottom: '0.5rem' }}>
        {lineName} 駅乗降者数ランキング
      </h1>
      <p style={{ color: '#aaa', marginBottom: '2rem', fontSize: '0.95rem', lineHeight: '1.8' }}>
        {lineName}の駅乗降者数ランキングを掲載しています。2021年の利用者数データをもとに主要駅を比較できます。
      </p>

      <section style={{ marginBottom: '2rem' }}>
        <div style={{ background: '#111827', borderRadius: '8px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #1e2d45' }}>
                {['順位', '駅名', '都道府県', '2021年乗降者数', ''].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: '#aaa' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #1e2d45' }}>
                  <td style={{ padding: '10px 16px', color: i < 3 ? '#00d4aa' : '#aaa', fontWeight: i < 3 ? 'bold' : 'normal' }}>
                    {i + 1}位
                  </td>
                  <td style={{ padding: '10px 16px', fontWeight: 'bold' }}>
                    <Link href={`/station/${r.slug}`} style={{ color: '#e8edf5', textDecoration: 'none' }}>
                      {r.station_name}駅
                    </Link>
                  </td>
                  <td style={{ padding: '10px 16px', color: '#aaa' }}>{r.prefecture}</td>
                  <td style={{ padding: '10px 16px' }}>
                    {Number(r.passengers_2021).toLocaleString()}人
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    <Link href={`/station/${r.slug}`} style={{ color: '#00d4aa', textDecoration: 'none', fontSize: '0.85rem', border: '1px solid #00d4aa', borderRadius: '4px', padding: '4px 10px' }}>
                      詳細
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <Link href={`/line/${slug}`} style={{ color: '#00d4aa', textDecoration: 'none', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', fontSize: '0.9rem', display: 'inline-block' }}>
          🚃 {lineName}の駅一覧を見る
        </Link>
      </section>

    </main>
  );
}