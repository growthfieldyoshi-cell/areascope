import { neon } from '@neondatabase/serverless';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Breadcrumb from '@/components/Breadcrumb';

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

type LineStationRow = {
  station_name: string;
  line_name: string;
  prefecture_name: string;
  municipality_name: string;
  station_group_slug: string;
  population: number | null;
};

export async function generateStaticParams() {
  return Object.keys(LINE_MAP).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const lineName = LINE_MAP[slug];

  if (!lineName) {
    return {
      title: '路線が見つかりません｜AreaScope',
      robots: { index: false, follow: false },
    };
  }

  const title = `${lineName}の駅一覧｜AreaScope`;
  const description = `${lineName}の駅一覧を掲載。各駅が属する自治体の人口データとあわせて、沿線エリアの特徴を確認できます。`;

  return {
    title,
    description,
    alternates: { canonical: `${BASE_URL}/line/${slug}` },
    openGraph: {
      type: 'website',
      title,
      description,
      url: `${BASE_URL}/line/${slug}`,
      siteName: 'AreaScope',
      images: [{ url: OG_IMAGE }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [OG_IMAGE],
    },
    robots: { index: true, follow: true },
  };
}

export default async function LinePage({ params }: Props) {
  const { slug } = await params;
  const lineName = LINE_MAP[slug];

  if (!lineName) notFound();

  const allStations = (await sql`
    WITH grouped AS (
      SELECT DISTINCT ON (s.station_group_slug)
        s.station_name,
        s.line_name,
        s.prefecture_name,
        s.municipality_name,
        s.station_group_slug,
        mp.population
      FROM stations s
      LEFT JOIN municipality_populations mp
        ON s.municipality_code = mp.municipality_code
        AND mp.year = 2020
      WHERE s.line_name ILIKE ${'%' + lineName + '%'}
        AND s.station_group_slug IS NOT NULL
      ORDER BY s.station_group_slug, s.station_name
    )
    SELECT * FROM grouped
    ORDER BY population DESC NULLS LAST, station_name ASC
  `) as LineStationRow[];

  if (allStations.length === 0) notFound();

  const top20 = allStations.slice(0, 20);

  return (
    <main style={{ background: '#0a0e1a', minHeight: '100vh', color: '#e8edf5', padding: '2rem', fontFamily: 'sans-serif', maxWidth: '960px', margin: '0 auto' }}>
      <Breadcrumb items={[
        { label: 'TOP', href: '/' },
        { label: '路線一覧', href: '/line' },
        { label: lineName },
      ]} />

      <h1 style={{ fontSize: '1.8rem', color: '#00d4aa', marginBottom: '0.75rem' }}>
        {lineName}の駅一覧
      </h1>

      <p style={{ color: '#aaa', marginBottom: '0.75rem', lineHeight: '1.9', fontSize: '0.95rem' }}>
        {lineName}の全{allStations.length}駅を掲載しています。
        自治体人口（2020年）をもとに並べており、各駅ページでは所在地や人口推移を確認できます。
      </p>

      <p style={{ color: '#aaa', marginBottom: '2rem', fontSize: '0.9rem' }}>
        沿線エリアの規模感を把握したい場合の一覧ページとして活用できます。
      </p>

      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.3rem', color: '#00d4aa', marginBottom: '0.5rem' }}>
          {lineName} 自治体人口上位20駅
        </h2>
        <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '1rem' }}>
          駅が属する自治体の人口（2020年）が多い順に表示しています。
        </p>

        <div style={{ background: '#111827', borderRadius: '8px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #1e2d45' }}>
                {['順位', '駅名', '都道府県', '自治体', '自治体人口（2020年）', ''].map((h) => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: '#aaa' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {top20.map((r, i) => (
                <tr key={r.station_group_slug} style={{ borderBottom: '1px solid #1e2d45' }}>
                  <td style={{ padding: '10px 16px', color: i < 3 ? '#00d4aa' : '#aaa', fontWeight: i < 3 ? 'bold' : 'normal' }}>
                    {i + 1}位
                  </td>
                  <td style={{ padding: '10px 16px', fontWeight: 'bold' }}>
                    <Link href={`/station/${r.station_group_slug}`} style={{ color: '#e8edf5', textDecoration: 'none' }}>
                      {r.station_name}駅
                    </Link>
                  </td>
                  <td style={{ padding: '10px 16px', color: '#aaa' }}>{r.prefecture_name}</td>
                  <td style={{ padding: '10px 16px', color: '#aaa' }}>{r.municipality_name}</td>
                  <td style={{ padding: '10px 16px' }}>
                    {r.population ? `${Number(r.population).toLocaleString()}人` : '-'}
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    <Link href={`/station/${r.station_group_slug}`} style={{ color: '#00d4aa', textDecoration: 'none', fontSize: '0.85rem', border: '1px solid #00d4aa', borderRadius: '4px', padding: '4px 10px' }}>
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
          自治体人口（2020年）の多い順に表示しています。
        </p>

        <div style={{ background: '#111827', borderRadius: '8px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #1e2d45' }}>
                {['駅名', '都道府県', '自治体', '自治体人口（2020年）', ''].map((h) => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: '#aaa' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allStations.map((r) => (
                <tr key={r.station_group_slug} style={{ borderBottom: '1px solid #1e2d45' }}>
                  <td style={{ padding: '10px 16px', fontWeight: 'bold' }}>
                    <Link href={`/station/${r.station_group_slug}`} style={{ color: '#e8edf5', textDecoration: 'none' }}>
                      {r.station_name}駅
                    </Link>
                  </td>
                  <td style={{ padding: '10px 16px', color: '#aaa' }}>{r.prefecture_name}</td>
                  <td style={{ padding: '10px 16px', color: '#aaa' }}>{r.municipality_name}</td>
                  <td style={{ padding: '10px 16px' }}>
                    {r.population ? `${Number(r.population).toLocaleString()}人` : '-'}
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    <Link href={`/station/${r.station_group_slug}`} style={{ color: '#00d4aa', textDecoration: 'none', fontSize: '0.85rem', border: '1px solid #00d4aa', borderRadius: '4px', padding: '4px 10px' }}>
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
          全国の駅一覧やランキングページもあわせてご覧ください。
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/station-ranking" style={{ color: '#00d4aa', textDecoration: 'none', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', fontSize: '0.9rem' }}>
            🏆 全国駅ランキング
          </Link>
        </div>
      </section>
    </main>
  );
}