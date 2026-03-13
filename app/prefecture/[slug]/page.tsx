import { neon } from '@neondatabase/serverless';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

const sql = neon(process.env.DATABASE_URL!);

const BASE_URL = 'https://areascope.jp';
const OG_IMAGE = 'https://areascope.jp/og-default.jpg';

const PREF_MAP: Record<string, string> = {
  hokkaido: '北海道', aomori: '青森県', iwate: '岩手県',
  miyagi: '宮城県', akita: '秋田県', yamagata: '山形県',
  fukushima: '福島県', ibaraki: '茨城県', tochigi: '栃木県',
  gunma: '群馬県', saitama: '埼玉県', chiba: '千葉県',
  tokyo: '東京都', kanagawa: '神奈川県', niigata: '新潟県',
  toyama: '富山県', ishikawa: '石川県', fukui: '福井県',
  yamanashi: '山梨県', nagano: '長野県', gifu: '岐阜県',
  shizuoka: '静岡県', aichi: '愛知県', mie: '三重県',
  shiga: '滋賀県', kyoto: '京都府', osaka: '大阪府',
  hyogo: '兵庫県', nara: '奈良県', wakayama: '和歌山県',
  tottori: '鳥取県', shimane: '島根県', okayama: '岡山県',
  hiroshima: '広島県', yamaguchi: '山口県', tokushima: '徳島県',
  kagawa: '香川県', ehime: '愛媛県', kochi: '高知県',
  fukuoka: '福岡県', saga: '佐賀県', nagasaki: '長崎県',
  kumamoto: '熊本県', oita: '大分県', miyazaki: '宮崎県',
  kagoshima: '鹿児島県', okinawa: '沖縄県',
};

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return Object.keys(PREF_MAP).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const prefName = PREF_MAP[slug];

  if (!prefName) {
    return {
      title: '都道府県が見つかりません｜AreaScope',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = `${prefName}の駅乗降者数ランキング・駅一覧｜AreaScope`;
  const description = `${prefName}の駅乗降者数ランキングと全駅一覧を掲載。各駅の2011〜2021年の利用者数推移データも確認できます。不動産・都市分析にも活用できます。`;

  return {
    title,
    description,
    alternates: {
      canonical: `${BASE_URL}/prefecture/${slug}`,
    },
    openGraph: {
      type: 'website',
      title,
      description,
      url: `${BASE_URL}/prefecture/${slug}`,
      siteName: 'AreaScope',
      images: [{ url: OG_IMAGE }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [OG_IMAGE],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function PrefecturePage({ params }: Props) {
  const { slug } = await params;
  const prefName = PREF_MAP[slug];

  if (!prefName) notFound();

  const stations = await sql`
    SELECT station_name, line_name, slug, passengers_2021
    FROM stations
    WHERE prefecture = ${prefName}
    ORDER BY passengers_2021 DESC NULLS LAST
  `;

  const top20 = stations.slice(0, 20);

  return (
    <main
      style={{
        background: '#0a0e1a',
        minHeight: '100vh',
        color: '#e8edf5',
        padding: '2rem',
        fontFamily: 'sans-serif',
        maxWidth: '960px',
        margin: '0 auto',
      }}
    >
      <h1 style={{ fontSize: '1.8rem', color: '#00d4aa', marginBottom: '0.75rem' }}>
        {prefName}の駅乗降者数ランキング・駅一覧
      </h1>

      <p style={{ color: '#aaa', marginBottom: '0.75rem', lineHeight: '1.9', fontSize: '0.95rem' }}>
        {prefName}内の全{stations.length}駅の乗降者数データを掲載しています。
        2021年のデータをもとにランキング形式で表示しており、各駅ページでは2011〜2021年の利用者数推移も確認できます。
        不動産投資や都市分析など、エリアの人流把握にもご活用いただけます。
      </p>

      <p style={{ color: '#aaa', marginBottom: '2rem', fontSize: '0.9rem' }}>
        {prefName}の主要駅の人流傾向を把握したい方にも役立ちます。
      </p>

      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.3rem', color: '#00d4aa', marginBottom: '0.5rem' }}>
          {prefName} 乗降者数トップ20
        </h2>
        <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '1rem' }}>
          {prefName}内で2021年の乗降者数が多い上位20駅です。駅名をクリックすると詳細データを確認できます。
        </p>

        <div style={{ background: '#111827', borderRadius: '8px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #1e2d45' }}>
                {['順位', '駅名', '路線', '2021年乗降者数', ''].map((h) => (
                  <th
                    key={h}
                    style={{ padding: '10px 16px', textAlign: 'left', color: '#aaa' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {top20.map((r, i) => (
                <tr key={`${r.slug}-${i}`} style={{ borderBottom: '1px solid #1e2d45' }}>
                  <td
                    style={{
                      padding: '10px 16px',
                      color: i < 3 ? '#00d4aa' : '#aaa',
                      fontWeight: i < 3 ? 'bold' : 'normal',
                    }}
                  >
                    {i + 1}位
                  </td>
                  <td style={{ padding: '10px 16px', fontWeight: 'bold' }}>
                    <Link
                      href={`/station/${r.slug}`}
                      style={{ color: '#e8edf5', textDecoration: 'none' }}
                    >
                      {r.station_name}駅
                    </Link>
                  </td>
                  <td style={{ padding: '10px 16px', color: '#aaa' }}>{r.line_name}</td>
                  <td style={{ padding: '10px 16px' }}>
                    {r.passengers_2021
                      ? `${Number(r.passengers_2021).toLocaleString()}人`
                      : '-'}
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    <Link
                      href={`/station/${r.slug}`}
                      style={{
                        color: '#00d4aa',
                        textDecoration: 'none',
                        fontSize: '0.85rem',
                        border: '1px solid #00d4aa',
                        borderRadius: '4px',
                        padding: '4px 10px',
                      }}
                    >
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
          {prefName}の駅一覧（全{stations.length}駅）
        </h2>
        <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '1rem' }}>
          {prefName}内の全駅を乗降者数の多い順に表示しています。各駅の詳細ページでは年次推移データも確認できます。
        </p>

        <div style={{ background: '#111827', borderRadius: '8px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #1e2d45' }}>
                {['駅名', '路線', '2021年乗降者数', ''].map((h) => (
                  <th
                    key={h}
                    style={{ padding: '10px 16px', textAlign: 'left', color: '#aaa' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stations.map((r, i) => (
                <tr key={`${r.slug}-${i}`} style={{ borderBottom: '1px solid #1e2d45' }}>
                  <td style={{ padding: '10px 16px', fontWeight: 'bold' }}>
                    <Link
                      href={`/station/${r.slug}`}
                      style={{ color: '#e8edf5', textDecoration: 'none' }}
                    >
                      {r.station_name}駅
                    </Link>
                  </td>
                  <td style={{ padding: '10px 16px', color: '#aaa' }}>{r.line_name}</td>
                  <td style={{ padding: '10px 16px' }}>
                    {r.passengers_2021
                      ? `${Number(r.passengers_2021).toLocaleString()}人`
                      : '-'}
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    <Link
                      href={`/station/${r.slug}`}
                      style={{
                        color: '#00d4aa',
                        textDecoration: 'none',
                        fontSize: '0.85rem',
                        border: '1px solid #00d4aa',
                        borderRadius: '4px',
                        padding: '4px 10px',
                      }}
                    >
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
          全国の駅ランキングや駅一覧もあわせてご覧ください。
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link
            href="/station-ranking"
            style={{
              color: '#00d4aa',
              textDecoration: 'none',
              border: '1px solid #00d4aa',
              borderRadius: '6px',
              padding: '10px 20px',
              fontSize: '0.9rem',
            }}
          >
            🏆 全国駅乗降者数ランキング
          </Link>

          <Link
            href="/station/list"
            style={{
              color: '#00d4aa',
              textDecoration: 'none',
              border: '1px solid #00d4aa',
              borderRadius: '6px',
              padding: '10px 20px',
              fontSize: '0.9rem',
            }}
          >
            📋 全国駅一覧
          </Link>
        </div>
      </section>
    </main>
  );
}