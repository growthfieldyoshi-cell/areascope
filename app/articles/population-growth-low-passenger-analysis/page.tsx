import { Metadata } from 'next';
import { neon } from '@neondatabase/serverless';
import Link from 'next/link';

const sql = neon(process.env.DATABASE_URL!);

export const metadata: Metadata = {
  title: '人口増加なのに駅利用が少ない街ランキング【最新】',
  description: '人口増加率と駅乗降者数のギャップから、人口は増えているのに駅利用が相対的に弱い街をランキング。データに基づくエリア分析に活用できます。',
  alternates: {
    canonical: 'https://areascope.jp/articles/population-growth-low-passenger-analysis',
  },
  openGraph: {
    type: 'website',
    title: '人口増加なのに駅利用が少ない街ランキング【最新】',
    description: '人口増加率と駅乗降者数のギャップから、人口は増えているのに駅利用が相対的に弱い街をランキング。データに基づくエリア分析に活用できます。',
    url: 'https://areascope.jp/articles/population-growth-low-passenger-analysis',
    siteName: 'AreaScope',
  },
};

async function getLatestYear(): Promise<number> {
  const rows = await sql`SELECT MAX(year) AS year FROM station_passengers`;
  return rows[0]?.year ?? 2021;
}

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

export default async function PopulationGrowthLowPassengerAnalysisPage() {
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
        / LN(SUM(sp.passengers)::numeric + 1000),
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
          人口は増えているのに<span style={{ color: '#00d4aa' }}>駅利用が弱い街</span>ランキング
        </h1>

        <p style={{ color: '#e8edf5', fontSize: '16px', lineHeight: 1.8, marginBottom: '12px', fontWeight: 600 }}>
          人口が増えている街が、必ずしも「駅が強い街」とは限りません。
        </p>
        <p style={{ ...pStyle, marginBottom: '32px' }}>
          国勢調査の人口増加率（{popOlderYear}年→{popNewerYear}年）と国土交通省「国土数値情報」の駅乗降者数（{latestYear}年）を比較し、人口は増えているのに駅利用が相対的に弱い街をランキングしました。車社会の郊外や、駅から離れた住宅開発が進むエリアなど、「人口増 = 強い街」と単純化できない実態が見えてきます。
        </p>

        {/* TOP20ランキング */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>人口増加 × 駅利用ギャップ ランキングTOP20</h2>
          <p style={{ ...pStyle, marginBottom: '16px' }}>
            スコア = 人口増加率(%) / log(乗降者数 + 1000) で算出。人口が増えているのに駅利用が小さいほどスコアが高くなります。
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
                      {Number(row.score).toFixed(2)}
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
            このランキングは「人口増加率 / log(乗降者数 + 1000)」で算出しています。人口増加率が高いほどスコアは上がり、乗降者数が大きい駅ほどスコアは下がります。つまり「人口は増えているのに、駅利用が相対的に弱い」エリアが上位に来ます。
          </p>
          <p style={pStyle}>
            上位に入る街は、必ずしも「悪い街」ではありません。むしろ車移動が中心の郊外住宅地や、駅から離れた大規模開発地など、鉄道以外の生活動線で成り立っている街が多く含まれます。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            不動産投資や居住地選びにおいて、「人口が増えている = 駅前が栄えている」と短絡的に判断するのはリスクがあります。人口増加の中身が、駅利用を伴う実需なのか、車前提の住宅供給なのかを見極めることが重要です。各駅の時系列推移は<Link href="/station-ranking" style={linkStyle}>全国駅ランキング</Link>から確認できます。
          </p>
        </div>

        {/* こうした街の特徴 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>こうした街の特徴</h2>
          <ul style={{ color: '#aaa', fontSize: '15px', lineHeight: 2.2, paddingLeft: '20px', marginBottom: 0 }}>
            <li>車移動が中心で、駅よりロードサイド商業施設に人流が集まっている</li>
            <li>駅から離れた場所に大規模住宅地やニュータウンが開発されている</li>
            <li>人口は流入しているが、通勤・通学の拠点は隣接市区町村の駅を利用している</li>
            <li>ベッドタウンとして住宅供給は増えているが、駅周辺の商業集積は弱い</li>
            <li>不動産の資産価値が、駅近物件と駅遠物件で大きく二極化しやすい</li>
            <li>将来的に人口減少局面に入った場合、駅から遠いエリアから先に影響を受けやすい</li>
          </ul>
        </div>

        {/* まとめ */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>まとめ</h2>
          <p style={pStyle}>
            人口が増えているエリアは、一見すると有望に見えます。しかし、その増加が駅利用を伴っているかどうかで、エリアの性質は大きく異なります。駅利用が弱いエリアは、車前提の生活圏であることが多く、不動産の流動性や将来の資産価値に影響する可能性があります。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            引越し先の検討や不動産投資の判断においては、人口増加率だけでなく駅の乗降者数を合わせて確認することで、「見かけの人口増」と「実需のある成長」を区別できます。AreaScopeでは駅ごとの時系列データと<Link href="/population" style={linkStyle}>市区町村の人口推移</Link>を合わせて確認できます。
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
