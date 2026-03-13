import { neon } from '@neondatabase/serverless';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

const sql = neon(process.env.DATABASE_URL!);

const BASE_URL = 'https://areascope.jp';
const OG_IMAGE = 'https://areascope.jp/og-default.jpg';

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

export async function generateStaticParams() {
  return Object.keys(LINE_MAP).map(slug => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const lineName = LINE_MAP[slug];
  if (!lineName) return { title: '路線が見つかりません' };
  const title = `${lineName}の駅乗降者数ランキング・駅一覧｜AreaScope`;
  const description = `${lineName}の駅乗降者数ランキングと全駅一覧を掲載。各駅の2011〜2021年の利用者数推移データも確認できます。不動産・都市分析にも活用できます。`;
  return {
    title,
    description,
    alternates: { canonical: `${BASE_URL}/line/${slug}` },
    openGraph: {
      type: 'website', title, description,
      url: `${BASE_URL}/line/${slug}`,
      siteName: 'AreaScope',
      images: [{ url: OG_IMAGE }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [OG_IMAGE] },
    robots: { index: true, follow: true },
  };
}

export default async function LinePage({ params }: Props) {
  const { slug } = await params;
  const lineName = LINE_MAP[slug];
  if (!lineName) notFound();

  const [top20, allStations] = await Promise.all([
    sql`
      SELECT station_name, line_name, prefecture, slug, passengers_2021
      FROM stations
      WHERE line_name ILIKE ${'%' + lineName + '%'}
      ORDER BY passengers_2021 DESC NULLS LAST
      LIMIT 20
    `,
    sql`
      SELECT station_name, line_name, prefecture, slug, passengers_2021
      FROM stations
      WHERE line_name ILIKE ${'%' + lineName + '%'}
      ORDER BY passengers_2021 DESC NULLS LAST
    `,
  ]);

  if (allStations.length === 0) notFound();

  return (
    <main style={{ background: '#0a0e1a', minHeight: '100vh', color: '#e8edf5', padding: '2rem', fontFamily: 'sans-serif', maxWidth: '960px', margin: '0 auto' }}>

      <h1 style={{ fontSize: '1.8rem', color: '#00d4aa', marginBottom: '0.75rem' }}>
        {lineName}の駅乗降者数ランキング・駅一覧
      </h1>
      <p style={{ color: '#aaa', marginBottom: '0.75rem', lineHeight: '1.9', fontSize: '0.95rem' }}>
        {lineName}の全{allStations.length}駅の乗降者数データを掲載しています。
        2021年のデータをもとにランキング形式で表示しており、各駅ページでは2011〜2021年の利用者数推移も確認できます。
        不動産投資や都市分析など、沿線エリアの人流把握にもご活用いただけます。
      </p>
      <p style={{ color: '#aaa', marginBottom: '2rem', fontSize: '0.9rem' }}>
        {lineName}沿線の主要駅の人流傾向を把握したい方にも役立ちます。
      </p>

      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.3rem', color: '#00d4aa', marginBottom: '0.5rem' }}>
          {lineName} 乗降者数トップ20
        </h2>
        <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '1rem' }}>
          {lineName}で2021年の乗降者数が多い上位20駅です。駅名をクリックすると詳細データを確認できます。
        </p>
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
              {top20.map((r, i) => (
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
                    {r.passengers_2021 ? Number(r.passengers_2021).toLocaleString() + '人' : '-'}
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

      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.3rem', color: '#00d4aa', marginBottom: '0.5rem' }}>
          {lineName}の駅一覧（全{allStations.length}駅）
        </h2>
        <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '1rem' }}>
          {lineName}の全駅を乗降者数の多い順に表示しています。各駅の詳細ページでは年次推移データも確認できます。
        </p>
        <div style={{ background: '#111827', borderRadius: '8px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #1e2d45' }}>
                {['駅名', '都道府県', '2021年乗降者数', ''].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: '#aaa' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allStations.map((r, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #1e2d45' }}>
                  <td style={{ padding: '10px 16px', fontWeight: 'bold' }}>
                    <Link href={`/station/${r.slug}`} style={{ color: '#e8edf5', textDecoration: 'none' }}>
                      {r.station_name}駅
                    </Link>
                  </td>
                  <td style={{ padding: '10px 16px', color: '#aaa' }}>{r.prefecture}</td>
                  <td style={{ padding: '10px 16px' }}>
                    {r.passengers_2021 ? Number(r.passengers_2021).toLocaleString() + '人' : '-'}
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
        <h2 style={{ fontSize: '1.3rem', color: '#00d4aa', marginBottom: '0.5rem' }}>
          ほかの駅データを見る
        </h2>
        <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '1rem' }}>
          全国の駅ランキングや都道府県別データもあわせてご覧ください。
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/station-ranking" style={{ color: '#00d4aa', textDecoration: 'none', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', fontSize: '0.9rem' }}>
            🏆 全国駅乗降者数ランキング
          </Link>
          <Link href="/station/list" style={{ color: '#00d4aa', textDecoration: 'none', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', fontSize: '0.9rem' }}>
            📋 全国駅一覧
          </Link>
        </div>
      </section>

    </main>
  );
}