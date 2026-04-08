import { Metadata } from 'next';
import { neon } from '@neondatabase/serverless';
import Link from 'next/link';

const sql = neon(process.env.DATABASE_URL!);

export const metadata: Metadata = {
  title: '人口増加×駅乗降者数で見る成長エリアランキング【最新】｜将来性分析',
  description: '人口増加率と駅乗降者数を掛け合わせたスコアで、成長エリアTOP20をランキング。データに基づくエリア分析に活用できます。',
  alternates: {
    canonical: 'https://areascope.jp/articles/population-passengers-cross-analysis',
  },
  openGraph: {
    type: 'website',
    title: '人口増加×駅乗降者数で見る成長エリアランキング【最新】｜将来性分析',
    description: '人口増加率と駅乗降者数を掛け合わせたスコアで、成長エリアTOP20をランキング。データに基づくエリア分析に活用できます。',
    url: 'https://areascope.jp/articles/population-passengers-cross-analysis',
    siteName: 'AreaScope',
  },
};

/* 既存ランキング記事と同じパターン：MAX(year) で動的取得 */
async function getLatestYear(): Promise<number> {
  const rows = await sql`SELECT MAX(year) AS year FROM station_passengers`;
  return rows[0]?.year ?? 2021;
}

/* 人口データの直近2年を動的取得（例: 2015, 2020） */
async function getPopulationYears(): Promise<{ older: number; newer: number }> {
  const rows = await sql`
    SELECT DISTINCT year FROM municipality_populations ORDER BY year DESC LIMIT 2
  `;
  const newer = rows[0]?.year ?? 2020;
  const older = rows[1]?.year ?? 2015;
  return { older, newer };
}

type RankingRow = {
  station_group_slug: string;
  station_name: string;
  prefecture_name: string;
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

export default async function PopulationPassengersCrossAnalysisPage() {
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
      MAX(s.prefecture_name) AS prefecture_name,
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
        * LN(SUM(sp.passengers)::numeric),
        2
      ) AS score
    FROM stations s
    INNER JOIN station_passengers sp
      ON s.station_key = sp.station_key
      AND sp.year = ${latestYear}
    INNER JOIN pop_growth pg
      ON s.municipality_code = pg.municipality_code
    WHERE s.station_group_slug IS NOT NULL
      AND sp.passengers > 0
    GROUP BY s.station_group_slug
    HAVING
      SUM(sp.passengers) > 0
      AND ((MAX(pg.pop_newer)::numeric - MAX(pg.pop_older)::numeric)
            / MAX(pg.pop_older)::numeric) > 0
    ORDER BY score DESC
    LIMIT 20
  `) as RankingRow[];

  return (
    <main style={{ background: '#0a0e1a', minHeight: '100vh', color: '#e8edf5', fontFamily: 'sans-serif' }}>
      <article style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 20px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '16px', lineHeight: 1.4 }}>
          人口増加×駅乗降者数で見る<span style={{ color: '#00d4aa' }}>「成長エリアランキング」</span>
        </h1>

        <p style={{ color: '#e8edf5', fontSize: '16px', lineHeight: 1.8, marginBottom: '12px', fontWeight: 600 }}>
          人口が増えていて、かつ駅の利用者も多いエリアは「実需のある成長エリア」です。
        </p>
        <p style={{ ...pStyle, marginBottom: '32px' }}>
          このランキングでは、国勢調査の人口増加率（{popOlderYear}年→{popNewerYear}年）と国土交通省「国土数値情報」の駅乗降者数（{latestYear}年）を掛け合わせたスコアで、全国の成長エリアTOP20を算出しました。人口だけ、乗降者数だけでは見えない「実際に人が集まり、使われている街」を可視化します。
        </p>

        {/* TOP20ランキング */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>成長エリアランキングTOP20</h2>
          <p style={{ ...pStyle, marginBottom: '16px' }}>
            人口増加率 × log(乗降者数) のスコアで算出。人口が増え、かつ駅利用者が多いエリアほど上位になります。
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #1e2d45' }}>
                  {['順位', '駅名', '都道府県', '乗降者数', '人口増加率', 'スコア'].map((h) => (
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
                    <td style={{ padding: '10px 16px', color: '#aaa', whiteSpace: 'nowrap' }}>{row.prefecture_name}</td>
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

        {/* ロジック説明 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>このランキングのロジック</h2>
          <p style={pStyle}>
            成長エリアスコアは「人口増加率(%) × log(乗降者数)」で算出しています。人口増加率は{popOlderYear}年から{popNewerYear}年の国勢調査データ、乗降者数は{latestYear}年の国土数値情報をもとにしています。
          </p>
          <p style={pStyle}>
            人口増加率だけでランキングすると、もともと人口が少ない地域が上位に入りやすくなります。一方、乗降者数だけでは大都市のターミナル駅が常に上位を占め、成長性は見えません。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            対数（log）を乗降者数に適用することで、極端に大きい駅のスコアが過大にならず、「人口が実際に増えている」かつ「一定以上の人流がある」エリアが浮かび上がる仕組みです。
          </p>
        </div>

        {/* 成長エリアの特徴 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>成長エリアの特徴</h2>
          <ul style={{ color: '#aaa', fontSize: '15px', lineHeight: 2.2, paddingLeft: '20px', marginBottom: 0 }}>
            <li>再開発やタワーマンション建設で人口が流入し、駅利用者も連動して増加している</li>
            <li>都心へのアクセスが良く、通勤需要が安定的に存在する</li>
            <li>商業施設・生活インフラの整備が進み、居住地として選ばれやすい</li>
            <li>人口増加だけでなく、駅利用という実需データで裏付けられた成長である</li>
            <li>不動産の資産価値が維持・上昇しやすい傾向がある</li>
          </ul>
        </div>

        {/* まとめ */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>まとめ</h2>
          <p style={pStyle}>
            人口増加と駅利用の両面で成長しているエリアは、居住需要と経済活動が実際に伴っている地域です。引越し先や不動産投資の検討において、こうしたデータに基づくエリア評価は、イメージや知名度に頼らない判断材料になります。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            AreaScopeでは各駅の時系列データや市区町村の人口推移を個別に確認できます。このランキングで気になったエリアがあれば、駅ページから詳細を確認してみてください。
          </p>
        </div>

        {/* 内部リンク */}
        <div style={{ ...sectionStyle, textAlign: 'center' as const }}>
          <h2 style={{ ...h2Style, marginBottom: '12px' }}>関連データを見る</h2>
          <p style={{ color: '#6b7a99', fontSize: '13px', marginBottom: '16px' }}>
            気になる駅やエリアがあれば、詳細データを確認してみてください。
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/station-ranking" style={{ display: 'inline-block', color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
              全国駅ランキング
            </Link>
            <Link href="/articles/prefecture-ranking" style={{ display: 'inline-block', color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
              都道府県別駅ランキング一覧
            </Link>
            <Link href="/population" style={{ display: 'inline-block', color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
              人口分析
            </Link>
            <Link href="/articles" style={{ display: 'inline-block', color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
              他の記事を見る
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}
