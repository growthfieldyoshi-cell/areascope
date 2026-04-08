import { neon } from '@neondatabase/serverless';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

const sql = neon(process.env.DATABASE_URL!);

type Props = { params: Promise<{ prefecture_slug: string }> };

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

async function getPopulationYears(): Promise<{ older: number; newer: number }> {
  const rows = await sql`
    SELECT DISTINCT year FROM municipality_populations ORDER BY year DESC LIMIT 2
  `;
  const newer = rows[0]?.year ?? 2020;
  const older = rows[1]?.year ?? 2015;
  return { older, newer };
}

export async function generateStaticParams() {
  const rows = await sql`
    SELECT DISTINCT prefecture_slug
    FROM stations
    WHERE prefecture_slug IS NOT NULL
  `;
  return rows.map((r) => ({ prefecture_slug: r.prefecture_slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { prefecture_slug } = await params;
  const prefName = await getPrefectureName(prefecture_slug);
  if (!prefName) return {};
  const title = `${prefName}の成長エリアランキング【最新】｜人口増加×駅乗降者数`;
  const description = `${prefName}内の成長エリアを人口増加率×駅乗降者数でランキング化。将来性の高いエリアをデータで把握できます。`;
  return {
    title,
    description,
    alternates: { canonical: `https://areascope.jp/articles/growth-area-ranking/${prefecture_slug}` },
    openGraph: {
      type: 'website',
      title,
      description,
      url: `https://areascope.jp/articles/growth-area-ranking/${prefecture_slug}`,
      siteName: 'AreaScope',
    },
  };
}

type RankingRow = {
  station_group_slug: string;
  station_name: string;
  municipality_name: string;
  passengers: number;
  pop_growth_rate: number;
  score: number;
};

const sectionStyle = {
  background: '#111827',
  border: '1px solid #1e2d45',
  borderRadius: '12px',
  padding: '28px',
  marginBottom: '24px',
};

const h2Style = {
  fontSize: '20px',
  fontWeight: 700 as const,
  color: '#00d4aa',
  marginBottom: '16px',
};

const pStyle = {
  color: '#aaa',
  fontSize: '15px',
  lineHeight: 1.8,
  marginBottom: '12px',
};

const linkStyle = {
  color: '#00d4aa',
  textDecoration: 'underline' as const,
};

export default async function PrefectureGrowthAreaRankingPage({ params }: Props) {
  const { prefecture_slug } = await params;
  const prefName = await getPrefectureName(prefecture_slug);
  if (!prefName) notFound();

  const latestYear = await getLatestYear();
  const { older: popOlderYear, newer: popNewerYear } = await getPopulationYears();

  const rows = (await sql`
    WITH pop_growth AS (
      SELECT
        municipality_code,
        MAX(CASE WHEN year = ${popOlderYear} THEN population END) AS pop_older,
        MAX(CASE WHEN year = ${popNewerYear} THEN population END) AS pop_newer
      FROM municipality_populations
      WHERE year IN (${popOlderYear}, ${popNewerYear})
      GROUP BY municipality_code
      HAVING
        MAX(CASE WHEN year = ${popOlderYear} THEN population END) IS NOT NULL
        AND MAX(CASE WHEN year = ${popOlderYear} THEN population END) > 0
        AND MAX(CASE WHEN year = ${popNewerYear} THEN population END) IS NOT NULL
    )
    SELECT
      s.station_group_slug,
      MAX(s.station_name) AS station_name,
      MAX(s.municipality_name) AS municipality_name,
      CAST(SUM(sp.passengers) AS bigint) AS passengers,
      ROUND(
        ((MAX(pg.pop_newer)::numeric - MAX(pg.pop_older)::numeric)
          / MAX(pg.pop_older)::numeric) * 100,
        2
      ) AS pop_growth_rate,
      ROUND(
        ((MAX(pg.pop_newer)::numeric - MAX(pg.pop_older)::numeric)
          / MAX(pg.pop_older)::numeric) * 100
        * LN(SUM(sp.passengers)::numeric + 1000),
        2
      ) AS score
    FROM stations s
    INNER JOIN station_passengers sp
      ON s.station_key = sp.station_key
      AND sp.year = ${latestYear}
    INNER JOIN pop_growth pg
      ON s.municipality_code = pg.municipality_code
    WHERE s.station_group_slug IS NOT NULL
      AND s.prefecture_slug = ${prefecture_slug}
      AND sp.passengers > 0
    GROUP BY s.station_group_slug
    HAVING
      SUM(sp.passengers) > 0
      AND ((MAX(pg.pop_newer)::numeric - MAX(pg.pop_older)::numeric)
            / MAX(pg.pop_older)::numeric) > 0
    ORDER BY score DESC
    LIMIT 50
  `) as RankingRow[];

  if (rows.length === 0) notFound();

  return (
    <main style={{ background: '#0a0e1a', minHeight: '100vh', color: '#e8edf5', fontFamily: 'sans-serif' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'トップ', item: 'https://areascope.jp' },
              { '@type': 'ListItem', position: 2, name: '記事一覧', item: 'https://areascope.jp/articles' },
              { '@type': 'ListItem', position: 3, name: '成長エリア分析', item: 'https://areascope.jp/articles/growth-areas' },
              { '@type': 'ListItem', position: 4, name: `${prefName}の成長エリアランキング` },
            ],
          }),
        }}
      />
      <article style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 20px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '16px', lineHeight: 1.4 }}>
          {prefName}の人口増×人流増 <span style={{ color: '#00d4aa' }}>成長エリア</span>ランキング
        </h1>

        <p style={{ color: '#e8edf5', fontSize: '16px', lineHeight: 1.8, marginBottom: '12px', fontWeight: 600 }}>
          人口が増えていて、かつ駅利用も活発なエリアを{prefName}内でランキングしました。
        </p>
        <p style={{ ...pStyle, marginBottom: '32px' }}>
          国勢調査の人口増加率（{popOlderYear}年→{popNewerYear}年）と国土交通省「国土数値情報」の駅乗降者数（{latestYear}年）を掛け合わせたスコアで、{prefName}内の成長エリアを算出しました。人口だけ、乗降者数だけでは見えない「居住需要と人流需要の両方が伸びている街」を可視化します。
        </p>

        {/* ランキングテーブル */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>{prefName}の成長エリアランキング</h2>
          <p style={{ ...pStyle, marginBottom: '16px' }}>
            スコア = 人口増加率(%) × log(乗降者数 + 1000) で算出。人口が増え、かつ駅利用が多いエリアほど上位になります。
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #1e2d45' }}>
                  {['順位', '駅名', '自治体', '乗降者数', '人口増加率', 'スコア'].map((h) => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: '#aaa', whiteSpace: 'nowrap' }}>{h}</th>
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
                    <td style={{ padding: '10px 16px', color: '#aaa', whiteSpace: 'nowrap' }}>{row.municipality_name}</td>
                    <td style={{ padding: '10px 16px', whiteSpace: 'nowrap' }}>
                      {Number(row.passengers).toLocaleString()}人
                    </td>
                    <td style={{ padding: '10px 16px', color: '#00d4aa', whiteSpace: 'nowrap' }}>
                      +{Number(row.pop_growth_rate).toFixed(1)}%
                    </td>
                    <td style={{ padding: '10px 16px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                      {Number(row.score).toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* このエリアの詳細データ */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' }}>
          <Link href={`/station-ranking/${prefecture_slug}`} style={{ display: 'inline-block', color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
            {prefName}の駅乗降者数ランキングを見る
          </Link>
          <Link href={`/population-ranking/${prefecture_slug}`} style={{ display: 'inline-block', color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
            {prefName}の人口増加ランキングを見る
          </Link>
          <Link href={`/prefecture/${prefecture_slug}`} style={{ display: 'inline-block', color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
            {prefName}のエリア分析を見る
          </Link>
          <Link href={`/city/${prefecture_slug}`} style={{ display: 'inline-block', color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
            {prefName}の市区町村一覧を見る
          </Link>
        </div>

        {/* ロジック説明 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>このランキングの見方</h2>
          <p style={pStyle}>
            成長エリアスコアは「人口増加率(%) × log(乗降者数 + 1000)」で算出しています。人口増加率は{popOlderYear}年から{popNewerYear}年の国勢調査データ、乗降者数は{latestYear}年の国土数値情報をもとにしています。
          </p>
          <p style={pStyle}>
            人口増加率だけでは、駅から離れた車社会のエリアも上位に入りやすくなります。一方、乗降者数だけではターミナル駅が常に上位を占め、成長性は見えません。両方を掛け合わせることで、「実際に人が増えていて、駅も使われている」エリアが浮かび上がります。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            対数（log）を乗降者数に適用することで、極端に大きい駅のスコアが過大にならず、中規模でも成長している駅が適切に評価されます。
          </p>
        </div>

        {/* 成長エリアの特徴 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>{prefName}で成長しているエリアの特徴</h2>
          <ul style={{ color: '#aaa', fontSize: '15px', lineHeight: 2.2, paddingLeft: '20px', marginBottom: 0 }}>
            <li>再開発やマンション建設で人口が流入し、駅利用者も連動して増加している</li>
            <li>都心部へのアクセスが良く、通勤需要が安定的に存在する</li>
            <li>商業施設や生活インフラの整備が進み、居住地として選ばれやすい</li>
            <li>人口増加だけでなく、駅利用という実需データで裏付けられた成長である</li>
            <li>不動産の資産価値が維持・上昇しやすい傾向がある</li>
          </ul>
        </div>

        {/* まとめ */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>まとめ</h2>
          <p style={pStyle}>
            {prefName}内でも、人口増加と駅利用の両面で成長しているエリアは限られています。こうしたエリアは居住需要と経済活動が実際に伴っており、引越し先や不動産投資の検討において有力な候補になります。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            AreaScopeでは駅ごとの時系列データと<Link href="/population" style={linkStyle}>市区町村の人口推移</Link>を個別に確認できます。このランキングで気になったエリアがあれば、駅ページから詳細を確認してみてください。
          </p>
        </div>

        {/* 内部リンク */}
        <div style={{ ...sectionStyle, textAlign: 'center' as const }}>
          <h2 style={{ ...h2Style, marginBottom: '12px' }}>関連データを見る</h2>
          <p style={{ color: '#6b7a99', fontSize: '13px', marginBottom: '16px' }}>
            気になる駅やエリアがあれば、詳細データを確認してみてください。
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href={`/station-ranking/${prefecture_slug}`} style={{ display: 'inline-block', color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
              {prefName}の駅乗降者数ランキングを見る
            </Link>
            <Link href={`/population-ranking/${prefecture_slug}`} style={{ display: 'inline-block', color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
              {prefName}の人口増加ランキングを見る
            </Link>
            <Link href={`/prefecture/${prefecture_slug}`} style={{ display: 'inline-block', color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
              {prefName}のエリア分析を見る
            </Link>
            <Link href="/population" style={{ display: 'inline-block', color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
              人口分析
            </Link>
            <Link href="/articles" style={{ display: 'inline-block', color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
              記事一覧
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}
