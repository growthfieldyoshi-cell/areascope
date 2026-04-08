import { neon } from '@neondatabase/serverless';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Breadcrumb from '@/components/Breadcrumb';

const sql = neon(process.env.DATABASE_URL!);
const BASE_URL = 'https://areascope.jp';

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
  const title = `${prefName}の駅乗降者数ランキング【最新】｜主要駅TOP100`;
  const description = `${prefName}の駅乗降者数ランキングTOP100を掲載。主要駅の比較・エリア分析・人口推移との組み合わせも確認できます。`;
  return {
    title,
    description,
    alternates: { canonical: `${BASE_URL}/station-ranking/${prefectureSlug}` },
    openGraph: {
      type: 'website',
      title,
      description,
      url: `${BASE_URL}/station-ranking/${prefectureSlug}`,
      siteName: 'AreaScope',
    },
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
        <p style={{ color: '#aaa', fontSize: '15px', lineHeight: 1.8, marginBottom: '12px' }}>
          {prefName}の駅乗降者数ランキングです。国土交通省「国土数値情報」の{year}年データをもとに、県内で利用者数の多い駅を掲載しています。
        </p>
        <p style={{ color: '#6b7a99', fontSize: '14px', marginBottom: '32px', lineHeight: 1.7 }}>
          乗降者数が多い駅は、通勤・商業・観光など人の流れが集中するエリアの中心です。{prefName}内でどの駅に人が集まっているかをデータで確認できます。
        </p>

        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#00d4aa', marginBottom: '16px' }}>
          {prefName}の駅乗降者数ランキング
        </h2>

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

        {/* このランキングの見方 */}
        <div style={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: '12px', padding: '28px', marginTop: '48px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#00d4aa', marginBottom: '16px' }}>このランキングの見方</h2>
          <p style={{ color: '#aaa', fontSize: '15px', lineHeight: 1.8, marginBottom: '12px' }}>
            乗降者数とは、1日あたりに駅で乗車・降車した人数の合計です。同じ駅名で複数路線がある場合は合算した数値を使用しています。
          </p>
          <p style={{ color: '#aaa', fontSize: '15px', lineHeight: 1.8, marginBottom: '12px' }}>
            数字が大きい駅ほど、その駅を中心とした人の流れが大きいことを意味します。通勤・通学・買い物・観光など、さまざまな目的で駅が利用されています。
          </p>
          <p style={{ color: '#aaa', fontSize: '15px', lineHeight: 1.8, marginBottom: 0 }}>
            一般的に、複数路線が乗り入れるターミナル駅や、商業施設・オフィスが集積するエリアの駅が上位に入りやすい傾向があります。
          </p>
        </div>

        {/* 利用者が多い駅の特徴 */}
        <div style={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: '12px', padding: '28px', marginTop: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#00d4aa', marginBottom: '16px' }}>{prefName}で利用者が多い駅の特徴</h2>
          <ul style={{ color: '#aaa', fontSize: '15px', lineHeight: 2.2, paddingLeft: '20px', marginBottom: 0 }}>
            <li>複数路線が集まるターミナル駅が上位に入りやすい</li>
            <li>乗換駅や沿線の中心駅は、広域からの利用者が集まるため利用者数が大きい</li>
            <li>商業施設やオフィスが集まる駅は、通勤・買い物需要で利用者数が伸びやすい</li>
            <li>観光地の最寄り駅は、季節やイベントにより利用者数が変動しやすい</li>
            <li>再開発が進むエリアでは、新規居住者の増加に伴い利用者数が成長している駅もある</li>
          </ul>
        </div>

        {/* まとめ */}
        <div style={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: '12px', padding: '28px', marginTop: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#00d4aa', marginBottom: '16px' }}>まとめ</h2>
          <p style={{ color: '#aaa', fontSize: '15px', lineHeight: 1.8, marginBottom: '12px' }}>
            このページでは、{prefName}内の駅を乗降者数順に確認できます。どの駅に人が集まっているかを把握することで、県内の人流構造が見えてきます。
          </p>
          <p style={{ color: '#aaa', fontSize: '15px', lineHeight: 1.8, marginBottom: 0 }}>
            各駅の時系列データや人口推移と組み合わせると、エリアの成長性や特徴をより深く分析できます。気になる駅があれば、駅名をクリックして詳細ページをご確認ください。
          </p>
        </div>

        {/* 関連データを見る */}
        <div style={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: '12px', padding: '28px', marginTop: '24px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#00d4aa', marginBottom: '12px' }}>関連データを見る</h2>
          <p style={{ color: '#6b7a99', fontSize: '13px', marginBottom: '16px' }}>
            人流や人口データと組み合わせて、エリアをさらに分析できます。
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/articles/passenger-analysis" style={{ display: 'inline-block', color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
              人流分析の記事一覧
            </Link>
            <Link href="/articles/growth-areas" style={{ display: 'inline-block', color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
              成長エリア分析
            </Link>
            <Link href="/population" style={{ display: 'inline-block', color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
              人口分析
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
