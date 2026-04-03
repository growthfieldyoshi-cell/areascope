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

type LineRankingRow = {
  station_name: string;
  prefecture_name: string;
  municipality_name: string;
  slug: string;
  population: number | null;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const lineName = LINE_MAP[slug];

  if (!lineName) {
    return { title: '路線が見つかりません｜AreaScope' };
  }

  return {
    title: `${lineName}の駅ランキング（自治体人口順）｜AreaScope`,
    description: `${lineName}の駅を自治体人口順にランキング。沿線のどの駅が人口の多いエリアにあるかをデータで確認できます。`,
    alternates: { canonical: `${BASE_URL}/line/${slug}/ranking` },
    robots: { index: true, follow: true },
  };
}

export default async function LineRankingPage({ params }: Props) {
  const { slug } = await params;
  const lineName = LINE_MAP[slug];

  if (!lineName) notFound();

  const rows = (await sql`
    SELECT
      s.station_name,
      s.prefecture_name,
      s.municipality_name,
      s.slug,
      mp.population
    FROM stations s
    LEFT JOIN municipalities m
      ON s.municipality_code = m.jis_code
    LEFT JOIN municipality_populations mp
      ON m.jis_code = mp.municipality_code
      AND mp.year = 2020
    WHERE s.line_name ILIKE ${'%' + lineName + '%'}
      AND s.slug IS NOT NULL
    ORDER BY mp.population DESC NULLS LAST, s.station_name ASC
    LIMIT 50
  `) as LineRankingRow[];

  if (rows.length === 0) notFound();

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
      <h1 style={{ fontSize: '1.8rem', color: '#00d4aa', marginBottom: '0.5rem' }}>
        {lineName} 自治体人口上位駅
      </h1>

      <p style={{ color: '#aaa', marginBottom: '0.8rem', fontSize: '0.95rem', lineHeight: '1.8' }}>
        {lineName}の駅を、駅が属する自治体の人口（2020年）順でランキングしています。沿線のどの駅が人口の多いエリアにあるかが分かります。
      </p>
      <p style={{ color: '#6b7a99', marginBottom: '2rem', fontSize: '0.9rem', lineHeight: '1.7' }}>
        人口が多い自治体にある駅は、通勤・商業・生活の需要が集まりやすく、路線内での中心的な役割を担っている傾向があります。
      </p>

      <h2 style={{ fontSize: '1.3rem', color: '#00d4aa', marginBottom: '1rem' }}>
        {lineName}の駅ランキング（自治体人口順）
      </h2>

      <section style={{ marginBottom: '2rem' }}>
        <div style={{ background: '#111827', borderRadius: '8px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #1e2d45' }}>
                {['順位', '駅名', '都道府県', '自治体', '自治体人口（2020年）', ''].map((h) => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: '#aaa' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
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
                    <Link href={`/station/${r.slug}`} style={{ color: '#e8edf5', textDecoration: 'none' }}>
                      {r.station_name}駅
                    </Link>
                  </td>
                  <td style={{ padding: '10px 16px', color: '#aaa' }}>{r.prefecture_name}</td>
                  <td style={{ padding: '10px 16px', color: '#aaa' }}>{r.municipality_name}</td>
                  <td style={{ padding: '10px 16px' }}>
                    {r.population ? `${Number(r.population).toLocaleString()}人` : '-'}
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

      <section style={{ marginBottom: '2rem' }}>
        <Link
          href={`/line/${slug}`}
          style={{
            color: '#00d4aa',
            textDecoration: 'none',
            border: '1px solid #00d4aa',
            borderRadius: '6px',
            padding: '10px 20px',
            fontSize: '0.9rem',
            display: 'inline-block',
          }}
        >
          🚃 {lineName}の駅一覧を見る
        </Link>
      </section>

      {/* このランキングの見方 */}
      <div style={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: '12px', padding: '28px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#00d4aa', marginBottom: '16px' }}>このランキングの見方</h2>
        <p style={{ color: '#aaa', fontSize: '15px', lineHeight: 1.8, marginBottom: '12px' }}>
          このランキングは、{lineName}の各駅が属する自治体の人口（2020年国勢調査）で順位付けしています。自治体人口が多いエリアにある駅ほど上位に表示されます。
        </p>
        <p style={{ color: '#aaa', fontSize: '15px', lineHeight: 1.8, marginBottom: '12px' }}>
          人口が多い自治体にある駅は、周辺の居住者数が多く、通勤・通学・買い物など日常的な利用者が集まりやすい傾向があります。
        </p>
        <p style={{ color: '#aaa', fontSize: '15px', lineHeight: 1.8, marginBottom: 0 }}>
          ターミナル駅や乗換駅は、自治体人口に加えて広域からの乗り換え需要も加わるため、路線内での重要度が高くなりやすいです。
        </p>
      </div>

      {/* 利用者が多い駅の特徴 */}
      <div style={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: '12px', padding: '28px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#00d4aa', marginBottom: '16px' }}>{lineName}で上位に入る駅の特徴</h2>
        <ul style={{ color: '#aaa', fontSize: '15px', lineHeight: 2.2, paddingLeft: '20px', marginBottom: 0 }}>
          <li>ターミナル駅や乗換駅は人口の多い自治体に位置していることが多い</li>
          <li>商業施設やオフィスが集まるエリアの駅は、人口規模が大きい自治体に属しやすい</li>
          <li>都市中心部に近い駅ほど、自治体人口が多く上位に入りやすい</li>
          <li>郊外の駅でも、ベッドタウンとして発展した自治体に属する駅は上位に入ることがある</li>
        </ul>
      </div>

      {/* まとめ */}
      <div style={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: '12px', padding: '28px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#00d4aa', marginBottom: '16px' }}>まとめ</h2>
        <p style={{ color: '#aaa', fontSize: '15px', lineHeight: 1.8, marginBottom: '12px' }}>
          このページでは、{lineName}の沿線構造を自治体人口の視点から確認できます。人口が多いエリアに位置する駅は、生活需要や商業需要が集まりやすい傾向があります。
        </p>
        <p style={{ color: '#aaa', fontSize: '15px', lineHeight: 1.8, marginBottom: 0 }}>
          各駅の詳細ページでは乗降者数の時系列データも確認できるため、人口データと合わせてエリア分析に活用できます。
        </p>
      </div>

      {/* 関連データを見る */}
      <div style={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: '12px', padding: '28px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#00d4aa', marginBottom: '12px' }}>関連データを見る</h2>
        <p style={{ color: '#6b7a99', fontSize: '13px', marginBottom: '16px' }}>
          路線データと合わせて、人流や成長エリアのデータも確認できます。
        </p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/articles/passenger-analysis" style={{ display: 'inline-block', color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
            人流分析の記事一覧
          </Link>
          <Link href="/articles/growth-areas" style={{ display: 'inline-block', color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
            成長エリア分析
          </Link>
          <Link href="/station-ranking" style={{ display: 'inline-block', color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
            全国駅ランキング
          </Link>
          <Link href="/articles/prefecture-rankings" style={{ display: 'inline-block', color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
            都道府県別ランキング一覧
          </Link>
        </div>
      </div>
    </main>
  );
}