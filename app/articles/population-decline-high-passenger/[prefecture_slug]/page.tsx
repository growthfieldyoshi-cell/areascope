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
  return {
    title: `${prefName}の人口減×人流強い街ランキング｜AreaScope`,
    description: `${prefName}内で人口減少率と駅乗降者数を掛け合わせ、人口は減っているのに人流が強い街をランキング形式で紹介。データに基づくエリア分析に活用できます。`,
    alternates: { canonical: `https://areascope.jp/articles/population-decline-high-passenger/${prefecture_slug}` },
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

export default async function PrefecturePopulationDeclineHighPassengerPage({ params }: Props) {
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
        ABS(
          ((MAX(pg.pop_newer)::numeric - MAX(pg.pop_older)::numeric)
            / MAX(pg.pop_older)::numeric) * 100
        )
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
            / MAX(pg.pop_older)::numeric) < 0
    ORDER BY score DESC
    LIMIT 50
  `) as RankingRow[];

  if (rows.length === 0) notFound();

  return (
    <main style={{ background: '#0a0e1a', minHeight: '100vh', color: '#e8edf5', fontFamily: 'sans-serif' }}>
      <article style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 20px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '16px', lineHeight: 1.4 }}>
          {prefName}の人口減×<span style={{ color: '#00d4aa' }}>人流強い街</span>ランキング
        </h1>

        <p style={{ color: '#e8edf5', fontSize: '16px', lineHeight: 1.8, marginBottom: '12px', fontWeight: 600 }}>
          人口が減っていても、駅が活発に使われている街は{prefName}にもあります。
        </p>
        <p style={{ ...pStyle, marginBottom: '32px' }}>
          国勢調査の人口増加率（{popOlderYear}年→{popNewerYear}年）と国土交通省「国土数値情報」の駅乗降者数（{latestYear}年）を比較し、{prefName}内で人口は減少しているのに人流が強い街をランキングしました。観光地、商業集積地、オフィス街、広域ターミナルなど、居住人口とは異なる需要で駅が使われている実態が見えてきます。
        </p>

        {/* ランキングテーブル */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>{prefName}の人口減×人流強い街ランキング</h2>
          <p style={{ ...pStyle, marginBottom: '16px' }}>
            スコア = |人口減少率(%)| × log(乗降者数 + 1000) で算出。人口が減っているのに駅利用が大きいほどスコアが高くなります。
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
                    <td style={{ padding: '10px 16px', color: '#f87171', whiteSpace: 'nowrap' }}>
                      {Number(row.pop_growth_rate).toFixed(1)}%
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

        {/* ロジック説明 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>このランキングの見方</h2>
          <p style={pStyle}>
            このランキングは「|人口減少率(%)| × log(乗降者数 + 1000)」で算出しています。人口減少率の絶対値が大きく、かつ乗降者数が多い駅ほどスコアが高くなります。つまり「人口は減っているのに、駅はしっかり使われている」エリアが上位に来ます。
          </p>
          <p style={pStyle}>
            こうしたエリアが存在する理由は、居住人口と来訪人口の違いです。観光地は住民が減っても旅行者が駅を利用し、商業集積地やオフィス街は周辺自治体からの通勤・買い物客が乗降者数を支えています。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            不動産投資や商圏分析においては、人口減少だけで「衰退エリア」と判断すると、こうした来訪需要を見落とすリスクがあります。各駅の時系列推移は<Link href="/station-ranking" style={linkStyle}>全国駅ランキング</Link>から確認できます。
          </p>
        </div>

        {/* こうした街が生まれる背景 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>{prefName}でこうした街が生まれる背景</h2>
          <ul style={{ color: '#aaa', fontSize: '15px', lineHeight: 2.2, paddingLeft: '20px', marginBottom: 0 }}>
            <li>観光需要が強く、居住人口とは無関係に駅利用者が多い</li>
            <li>商業集積が強く、周辺自治体からの買い物客・来街者が駅の乗降者数を支えている</li>
            <li>オフィス街・業務地として通勤需要が大きく、昼間人口が夜間人口を大幅に上回る</li>
            <li>広域ターミナルとして複数路線が交差し、乗り換え需要が大きい</li>
            <li>居住者は高齢化・減少傾向でも、商圏としての集客力は維持されている</li>
            <li>不動産の評価が「居住用」と「商業・投資用」で大きく異なるケースが多い</li>
          </ul>
        </div>

        {/* まとめ */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>まとめ</h2>
          <p style={pStyle}>
            {prefName}内でも、人口が減少しているのに人流が強い街は存在します。こうしたエリアは、居住需要ではなく来訪需要や商業需要で経済が回っており、人口データだけでは見えない街の実力を持っています。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            商圏分析や不動産投資においては、人口推移と駅利用データを合わせて確認することで、「住む人は減っているが、来る人は多い」エリアの実態を正確に把握できます。AreaScopeでは駅ごとの時系列データと<Link href="/population" style={linkStyle}>市区町村の人口推移</Link>を個別に確認できます。
          </p>
        </div>

        {/* 内部リンク */}
        <div style={{ ...sectionStyle, textAlign: 'center' as const }}>
          <h2 style={{ ...h2Style, marginBottom: '12px' }}>関連データを見る</h2>
          <p style={{ color: '#6b7a99', fontSize: '13px', marginBottom: '16px' }}>
            気になる駅やエリアがあれば、詳細データを確認してみてください。
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/population" style={{ display: 'inline-block', color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
              人口分析
            </Link>
            <Link href="/articles/prefecture-ranking" style={{ display: 'inline-block', color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
              都道府県別駅ランキング一覧
            </Link>
            <Link href="/station-ranking" style={{ display: 'inline-block', color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
              全国駅ランキング
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
