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

const PREF_NAMES: Record<string, string> = {
  hokkaido: '北海道', aomori: '青森県', iwate: '岩手県', miyagi: '宮城県',
  akita: '秋田県', yamagata: '山形県', fukushima: '福島県', ibaraki: '茨城県',
  tochigi: '栃木県', gunma: '群馬県', saitama: '埼玉県', chiba: '千葉県',
  tokyo: '東京都', kanagawa: '神奈川県', niigata: '新潟県', toyama: '富山県',
  ishikawa: '石川県', fukui: '福井県', yamanashi: '山梨県', nagano: '長野県',
  gifu: '岐阜県', shizuoka: '静岡県', aichi: '愛知県', mie: '三重県',
  shiga: '滋賀県', kyoto: '京都府', osaka: '大阪府', hyogo: '兵庫県',
  nara: '奈良県', wakayama: '和歌山県', tottori: '鳥取県', shimane: '島根県',
  okayama: '岡山県', hiroshima: '広島県', yamaguchi: '山口県', tokushima: '徳島県',
  kagawa: '香川県', ehime: '愛媛県', kochi: '高知県', fukuoka: '福岡県',
  saga: '佐賀県', nagasaki: '長崎県', kumamoto: '熊本県', oita: '大分県',
  miyazaki: '宮崎県', kagoshima: '鹿児島県', okinawa: '沖縄県',
};

export function generateStaticParams() {
  return Object.keys(PREF_NAMES).map((slug) => ({ slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const prefName = PREF_NAMES[slug];
  if (!prefName) return { title: '都道府県が見つかりません｜AreaScope' };
  const title = `${prefName}の駅乗降者数ランキング【最新】｜主要駅TOP50`;
  const description = `${prefName}の駅乗降者数ランキングTOP50を掲載。人の流れと人口データを組み合わせてエリアの特徴を把握できます。`;
  return {
    title,
    description,
    alternates: { canonical: `${BASE_URL}/prefecture/${slug}` },
    robots: { index: true, follow: true },
    openGraph: {
      type: 'website',
      title,
      description,
      url: `${BASE_URL}/prefecture/${slug}`,
      siteName: 'AreaScope',
    },
  };
}

export default async function PrefectureDetailPage({ params }: Props) {
  const { slug } = await params;
  const prefName = PREF_NAMES[slug];
  if (!prefName) notFound();

  const year = await getLatestYear();

  const stations = await sql`
    SELECT
      s.station_group_slug,
      MAX(s.station_name) AS station_name,
      MAX(s.municipality_name) AS municipality_name,
      CAST(SUM(sp.passengers) AS bigint) AS passengers
    FROM stations s
    LEFT JOIN station_passengers sp
      ON s.station_key = sp.station_key
      AND sp.year = ${year}
    WHERE s.prefecture_slug = ${slug}
      AND s.station_group_slug IS NOT NULL
    GROUP BY s.station_group_slug
    ORDER BY passengers DESC NULLS LAST
    LIMIT 50
  `;

  if (stations.length === 0) notFound();

  const topPassengers = stations[0]?.passengers ? Number(stations[0].passengers) : 0;

  return (
    <main style={{ background: '#0a0e1a', minHeight: '100vh', color: '#e8edf5', fontFamily: "'Noto Sans JP', sans-serif" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'トップ', item: 'https://areascope.jp' },
              { '@type': 'ListItem', position: 2, name: '都道府県一覧', item: 'https://areascope.jp/prefecture' },
              { '@type': 'ListItem', position: 3, name: prefName },
            ],
          }),
        }}
      />
      <header style={{ padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1e2d45', background: 'rgba(10,14,26,0.95)' }}>
        <Link href="/" style={{ fontSize: '22px', fontWeight: 800, textDecoration: 'none', color: '#e8edf5' }}>
          AREA<span style={{ color: '#00d4aa' }}>SCOPE</span>
        </Link>
      </header>

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '40px 20px' }}>
        <nav style={{ marginBottom: '1.5rem', fontSize: '0.85rem', color: '#6b7a99' }}>
          <Link href="/" style={{ color: '#6b7a99', textDecoration: 'none' }}>トップ</Link>
          {' / '}
          <Link href="/prefecture" style={{ color: '#6b7a99', textDecoration: 'none' }}>都道府県一覧</Link>
          {' / '}
          <span style={{ color: '#e8edf5' }}>{prefName}</span>
        </nav>

        <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#00d4aa', letterSpacing: '3px', marginBottom: '12px' }}>// エリアデータ</div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>
          <span style={{ color: '#00d4aa' }}>{prefName}</span>の駅ランキング
        </h1>

        <p style={{ fontSize: '14px', color: '#9aa5c3', lineHeight: 1.8, marginBottom: '12px' }}>
          {prefName}の人口や主要駅の乗降者数データをもとに、エリアの特徴を可視化しています。
        </p>
        <p style={{ fontSize: '14px', color: '#9aa5c3', lineHeight: 1.8, marginBottom: '12px' }}>
          駅の乗降者数は人の流れを示し、人口は居住規模を示します。これらを組み合わせることでエリアの特徴を把握できます。
        </p>
        <p style={{ fontSize: '14px', color: '#9aa5c3', lineHeight: 1.8, marginBottom: '32px' }}>
          {prefName}の最多利用駅は<strong style={{ color: '#e8edf5' }}>{stations[0]?.station_name}駅</strong>で、
          {year}年の乗降者数は<strong style={{ color: '#e8edf5' }}>{topPassengers.toLocaleString()}人</strong>です。
          {topPassengers > 500000
            ? '大規模なターミナル駅を擁するエリアです。'
            : topPassengers > 100000
            ? '中規模以上の主要駅があるエリアです。'
            : '地域密着型の駅が中心のエリアです。'}
        </p>

        <h2 style={{ fontSize: '1.3rem', color: '#00d4aa', marginBottom: '1rem' }}>
          {prefName}の主要駅と人の流れ
        </h2>

        <section style={{ marginBottom: '2rem' }}>
          <div style={{ background: '#111827', borderRadius: '8px', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #1e2d45' }}>
                  {['順位', '駅名', '市区町村', `乗降者数（${year}年）`, ''].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: '#aaa' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stations.map((s, i) => (
                  <tr key={s.station_group_slug} style={{ borderBottom: '1px solid #1e2d45' }}>
                    <td style={{ padding: '10px 16px', color: i < 3 ? '#00d4aa' : '#aaa', fontWeight: i < 3 ? 'bold' : 'normal' }}>
                      {i + 1}位
                    </td>
                    <td style={{ padding: '10px 16px', fontWeight: 'bold' }}>
                      <Link href={`/station/${s.station_group_slug}`} style={{ color: '#e8edf5', textDecoration: 'none' }}>
                        {s.station_name}駅
                      </Link>
                    </td>
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

        {/* FAQ */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.2rem', color: '#00d4aa', marginBottom: '1rem' }}>
            {prefName}に関するよくある質問
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: '8px', padding: '16px' }}>
              <p style={{ fontWeight: 700, marginBottom: '8px' }}>Q. {prefName}で最も利用者が多い駅は？</p>
              <p style={{ color: '#9aa5c3', fontSize: '14px', lineHeight: 1.7, margin: 0 }}>
                {stations[0]?.station_name}駅です。{year}年の乗降者数は{topPassengers.toLocaleString()}人となっています。
              </p>
            </div>
            <div style={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: '8px', padding: '16px' }}>
              <p style={{ fontWeight: 700, marginBottom: '8px' }}>Q. {prefName}の駅データはどこから取得していますか？</p>
              <p style={{ color: '#9aa5c3', fontSize: '14px', lineHeight: 1.7, margin: 0 }}>
                国土交通省の国土数値情報をもとに集計しています。乗降者数は{year}年のデータを使用しています。
              </p>
            </div>
            <div style={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: '8px', padding: '16px' }}>
              <p style={{ fontWeight: 700, marginBottom: '8px' }}>Q. {prefName}は人口が多い地域ですか？</p>
              <p style={{ color: '#9aa5c3', fontSize: '14px', lineHeight: 1.7, margin: 0 }}>
                {slug === 'tokyo' || slug === 'kanagawa' || slug === 'osaka' || slug === 'aichi' || slug === 'saitama' || slug === 'chiba'
                  ? `${prefName}は日本有数の人口集積エリアです。`
                  : `${prefName}の市区町村別人口は市区町村ページで確認できます。`}
              </p>
            </div>
          </div>
        </section>

        <section style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href={`/station-ranking?pref=${slug}`} style={{ color: '#00d4aa', textDecoration: 'none', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', fontSize: '0.9rem' }}>
            🏆 {prefName}の駅ランキング（全国比較）
          </Link>
          <Link href="/city" style={{ color: '#6b7a99', textDecoration: 'none', border: '1px solid #1e2d45', borderRadius: '6px', padding: '10px 20px', fontSize: '0.9rem' }}>
            🏙️ 市区町村一覧
          </Link>
          <Link href="/prefecture" style={{ color: '#6b7a99', textDecoration: 'none', border: '1px solid #1e2d45', borderRadius: '6px', padding: '10px 20px', fontSize: '0.9rem' }}>
            ← 都道府県一覧に戻る
          </Link>
        </section>
      </div>
    </main>
  );
}