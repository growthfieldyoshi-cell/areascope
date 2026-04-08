import { neon } from '@neondatabase/serverless';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

const sql = neon(process.env.DATABASE_URL!);
const BASE_URL = 'https://areascope.jp';

async function getLatestYear(): Promise<number> {
  const rows = await sql`SELECT MAX(year) AS year FROM station_passengers`;
  return rows[0]?.year ?? 2021;
}

// TODO: stations.line_slug を全路線で整備後、line_slug ベースに移行
// TODO: 埼京線はDB上でline_nameが分散しているため保留。将来、表示用路線マスタを作って再構成予定
const LINE_MAP: Record<string, { display_name: string; line_name: string; operator_name: string }> = {
  yamanote:          { display_name: '山手線',       line_name: '山手線',           operator_name: '東日本旅客鉄道' },
  chuo:              { display_name: '中央線',       line_name: '中央線',           operator_name: '東日本旅客鉄道' },
  toyoko:            { display_name: '東横線',       line_name: '東横線',           operator_name: '東急電鉄' },
  'keio-inokashira': { display_name: '京王井の頭線', line_name: '京王井の頭線',     operator_name: '京王電鉄' },
  keio:              { display_name: '京王線',       line_name: '京王線',           operator_name: '京王電鉄' },
  odakyu:            { display_name: '小田急線',     line_name: '小田原線',         operator_name: '小田急電鉄' },
  tokaido:           { display_name: '東海道線',     line_name: '東海道線',         operator_name: '東日本旅客鉄道' },
  sobu:              { display_name: '総武線',       line_name: '総武線',           operator_name: '東日本旅客鉄道' },
  marunouchi:        { display_name: '丸ノ内線',     line_name: '4号線丸ノ内線',    operator_name: '東京地下鉄' },
  hibiya:            { display_name: '日比谷線',     line_name: '2号線日比谷線',    operator_name: '東京地下鉄' },
  ginza:             { display_name: '銀座線',       line_name: '3号線銀座線',      operator_name: '東京地下鉄' },
  hanzomon:          { display_name: '半蔵門線',     line_name: '11号線半蔵門線',   operator_name: '東京地下鉄' },
  fukutoshin:        { display_name: '副都心線',     line_name: '13号線副都心線',   operator_name: '東京地下鉄' },
  namboku:           { display_name: '南北線',       line_name: '7号線南北線',      operator_name: '東京地下鉄' },
  chiyoda:           { display_name: '千代田線',     line_name: '9号線千代田線',    operator_name: '東京地下鉄' },
  yurakucho:         { display_name: '有楽町線',     line_name: '8号線有楽町線',    operator_name: '東京地下鉄' },
  tozai:             { display_name: '東西線',       line_name: '5号線東西線',      operator_name: '東京地下鉄' },
  mita:              { display_name: '三田線',       line_name: '6号線三田線',      operator_name: '東京都' },
  shinjuku:          { display_name: '新宿線',       line_name: '10号線新宿線',     operator_name: '東京都' },
  asakusa:           { display_name: '浅草線',       line_name: '1号線浅草線',      operator_name: '東京都' },
  oedo:              { display_name: '大江戸線',     line_name: '12号線大江戸線',   operator_name: '東京都' },
};

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const line = LINE_MAP[slug];
  if (!line) return { title: '路線が見つかりません｜AreaScope' };
  const title = `${line.display_name}の駅一覧・乗降者数ランキング【最新】`;
  const description = `${line.display_name}の駅ごとの乗降者数を掲載。人の流れを比較・ランキングで確認できます。`;
  return {
    title,
    description,
    alternates: { canonical: `${BASE_URL}/line/${slug}` },
    robots: { index: true, follow: true },
    openGraph: {
      type: 'website',
      title,
      description,
      url: `${BASE_URL}/line/${slug}`,
      siteName: 'AreaScope',
    },
  };
}

export default async function LineDetailPage({ params }: Props) {
  const { slug } = await params;
  const line = LINE_MAP[slug];
  if (!line) notFound();

  const year = await getLatestYear();

  const stations = await sql`
    SELECT
      s.station_group_slug,
      MAX(s.station_name) AS station_name,
      MAX(s.prefecture_name) AS prefecture_name,
      MAX(s.municipality_name) AS municipality_name,
      CAST(SUM(sp.passengers) AS bigint) AS passengers
    FROM stations s
    LEFT JOIN station_passengers sp
      ON s.station_key = sp.station_key
      AND sp.year = ${year}
    WHERE s.line_name = ${line.line_name}
      AND s.operator_name = ${line.operator_name}
      AND s.station_group_slug IS NOT NULL
    GROUP BY s.station_group_slug
    ORDER BY passengers DESC NULLS LAST, station_name ASC
  `;

  if (stations.length === 0) notFound();

  return (
    <main style={{ background: '#0a0e1a', minHeight: '100vh', color: '#e8edf5', padding: '2rem', fontFamily: 'sans-serif', maxWidth: '960px', margin: '0 auto' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'トップ', item: 'https://areascope.jp' },
              { '@type': 'ListItem', position: 2, name: '路線一覧', item: 'https://areascope.jp/line' },
              { '@type': 'ListItem', position: 3, name: line.display_name },
            ],
          }),
        }}
      />
      <nav style={{ marginBottom: '1.5rem', fontSize: '0.85rem', color: '#6b7a99' }}>
        <Link href="/" style={{ color: '#6b7a99', textDecoration: 'none' }}>トップ</Link>
        {' / '}
        <Link href="/line" style={{ color: '#6b7a99', textDecoration: 'none' }}>路線一覧</Link>
        {' / '}
        <span style={{ color: '#e8edf5' }}>{line.display_name}</span>
      </nav>

      <h1 style={{ fontSize: '1.8rem', color: '#00d4aa', marginBottom: '0.5rem' }}>
        {line.display_name} 駅一覧
      </h1>
      <p style={{ color: '#aaa', marginBottom: '2rem', fontSize: '0.95rem', lineHeight: '1.8' }}>
        {line.display_name}に属する駅一覧と乗降者数データを掲載しています。
        各駅の人の流れを比較することで、路線全体の特徴を把握できます。
      </p>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.2rem', color: '#00d4aa', marginBottom: '12px' }}>
          {line.display_name}の主要駅と人の流れ
        </h2>
        <div style={{ background: '#111827', borderRadius: '8px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #1e2d45' }}>
                {['駅名', '都道府県', '自治体', `乗降者数（${year}年）`, ''].map((h) => (
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
                    {s.passengers ? `${Number(s.passengers).toLocaleString()}人` : '-'}
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
        <Link href="/station-ranking" style={{ color: '#00d4aa', textDecoration: 'none', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', fontSize: '0.9rem' }}>
          🏆 全国駅乗降者数ランキング
        </Link>
        <Link href="/line" style={{ color: '#6b7a99', textDecoration: 'none', border: '1px solid #1e2d45', borderRadius: '6px', padding: '10px 20px', fontSize: '0.9rem' }}>
          ← 路線一覧に戻る
        </Link>
      </section>
    </main>
  );
}