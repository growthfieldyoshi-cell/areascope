import { Metadata } from 'next';
import { neon } from '@neondatabase/serverless';
import Link from 'next/link';
import Breadcrumb from '@/components/Breadcrumb';

const sql = neon(process.env.DATABASE_URL!);

export const metadata: Metadata = {
  title: '駅乗降者数の回復率ランキング【最新】｜2019年比',
  description: 'コロナ前後の駅乗降者数を比較し、回復率の高い駅をランキング形式で紹介。人流の回復状況をデータで可視化。',
  alternates: {
    canonical: 'https://areascope.jp/articles/station-passenger-recovery-analysis',
  },
  openGraph: {
    type: 'website',
    title: '駅乗降者数の回復率ランキング【最新】｜2019年比',
    description: 'コロナ前後の駅乗降者数を比較し、回復率の高い駅をランキング形式で紹介。人流の回復状況をデータで可視化。',
    url: 'https://areascope.jp/articles/station-passenger-recovery-analysis',
    siteName: 'AreaScope',
  },
};

async function getLatestYear(): Promise<number> {
  const rows = await sql`SELECT MAX(year) AS year FROM station_passengers`;
  return rows[0]?.year ?? 2021;
}

type RankingRow = {
  station_group_slug: string;
  station_name: string;
  prefecture_name: string;
  passengers_2019: number;
  passengers_latest: number;
  recovery_rate: number;
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

const PRE_COVID_YEAR = 2019;

export default async function StationPassengerRecoveryAnalysisPage() {
  const latestYear = await getLatestYear();

  const rows = (await sql`
    SELECT
      s.station_group_slug,
      MAX(s.station_name) AS station_name,
      MAX(s.prefecture_name) AS prefecture_name,
      CAST(SUM(CASE WHEN sp.year = ${PRE_COVID_YEAR} THEN sp.passengers ELSE 0 END) AS bigint) AS passengers_2019,
      CAST(SUM(CASE WHEN sp.year = ${latestYear} THEN sp.passengers ELSE 0 END) AS bigint) AS passengers_latest,
      ROUND(
        SUM(CASE WHEN sp.year = ${latestYear} THEN sp.passengers ELSE 0 END)::numeric
        / SUM(CASE WHEN sp.year = ${PRE_COVID_YEAR} THEN sp.passengers ELSE 0 END)::numeric
        * 100,
        1
      ) AS recovery_rate
    FROM stations s
    INNER JOIN station_passengers sp
      ON s.station_key = sp.station_key
      AND sp.year IN (${PRE_COVID_YEAR}, ${latestYear})
    WHERE s.station_group_slug IS NOT NULL
      AND sp.passengers > 0
    GROUP BY s.station_group_slug
    HAVING
      SUM(CASE WHEN sp.year = ${PRE_COVID_YEAR} THEN sp.passengers END) IS NOT NULL
      AND SUM(CASE WHEN sp.year = ${PRE_COVID_YEAR} THEN sp.passengers ELSE 0 END) > 0
      AND SUM(CASE WHEN sp.year = ${latestYear} THEN sp.passengers END) IS NOT NULL
      AND SUM(CASE WHEN sp.year = ${latestYear} THEN sp.passengers ELSE 0 END) > 0
    ORDER BY recovery_rate DESC
    LIMIT 20
  `) as RankingRow[];

  return (
    <main style={{ background: '#0a0e1a', minHeight: '100vh', color: '#e8edf5', fontFamily: 'sans-serif' }}>
      <article style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 20px' }}>
        <Breadcrumb items={[
          { label: 'TOP', href: '/' },
          { label: '記事一覧', href: '/articles' },
          { label: '駅乗降者数の回復率ランキング' },
        ]} />
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '16px', lineHeight: 1.4 }}>
          駅乗降者数の<span style={{ color: '#00d4aa' }}>回復率</span>ランキング（コロナ前後）
        </h1>

        <p style={{ color: '#e8edf5', fontSize: '16px', lineHeight: 1.8, marginBottom: '12px', fontWeight: 600 }}>
          コロナ前の水準をどれだけ取り戻したか。駅ごとの回復力をデータで比較します。
        </p>
        <p style={{ ...pStyle, marginBottom: '32px' }}>
          コロナ禍により全国の駅利用者数は大幅に減少しましたが、その後の回復状況は駅ごとに大きく異なります。国土交通省「国土数値情報」のデータをもとに、{PRE_COVID_YEAR}年（コロナ前）と{latestYear}年（最新）の乗降者数を比較し、回復率が高い駅TOP20をランキングしました。
        </p>

        {/* TOP20ランキング */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>回復率ランキングTOP20（{PRE_COVID_YEAR}年→{latestYear}年）</h2>
          <p style={{ ...pStyle, marginBottom: '16px' }}>
            回復率 = {latestYear}年の乗降者数 / {PRE_COVID_YEAR}年の乗降者数 × 100 で算出。同じ駅名に複数路線がある場合は合算した数値です。100%超えはコロナ前水準を上回った駅です。
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #1e2d45' }}>
                  {['順位', '駅名', '都道府県', `${PRE_COVID_YEAR}年`, `${latestYear}年`, '回復率'].map((h) => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: '#aaa', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => {
                  const rate = Number(row.recovery_rate);
                  const rateColor = rate >= 100 ? '#00d4aa' : rate >= 80 ? '#e8edf5' : '#f87171';
                  return (
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
                        {Number(row.passengers_2019).toLocaleString()}人
                      </td>
                      <td style={{ padding: '10px 16px', whiteSpace: 'nowrap' }}>
                        {Number(row.passengers_latest).toLocaleString()}人
                      </td>
                      <td style={{ padding: '10px 16px', fontWeight: 'bold', whiteSpace: 'nowrap', color: rateColor }}>
                        {rate.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ロジック説明 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>このランキングの見方</h2>
          <p style={pStyle}>
            回復率は「{latestYear}年の乗降者数 / {PRE_COVID_YEAR}年の乗降者数 × 100」で算出しています。100%であればコロナ前と同水準、100%を超えていればコロナ前を上回ったことを意味します。
          </p>
          <p style={pStyle}>
            回復率が高い駅には主に2つのパターンがあります。ひとつは観光需要の回復により利用者が戻った駅、もうひとつは再開発や人口流入により新たな利用者が増えた駅です。いずれも、エリアの人流が強いことを示す指標になります。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            一方、回復率が低い駅はオフィス街でのリモートワーク定着や、定期券利用者の減少が影響しているケースが多く見られます。各駅の年ごとの推移は<Link href="/station-ranking" style={linkStyle}>全国駅ランキング</Link>から個別に確認できます。
          </p>
        </div>

        {/* 回復が早い駅の特徴 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>回復が早い駅の特徴</h2>
          <ul style={{ color: '#aaa', fontSize: '15px', lineHeight: 2.2, paddingLeft: '20px', marginBottom: 0 }}>
            <li>観光需要が強く、インバウンド回復の恩恵を受けている（空港アクセス駅・観光地最寄り駅）</li>
            <li>再開発や大型商業施設の開業により、新たな来街者が増加している</li>
            <li>沿線の人口増加が続き、通勤・通学の実需が拡大している</li>
            <li>郊外住宅地の最寄り駅で、リモートワーク普及後も一定の通勤需要が残っている</li>
            <li>イベント・コンサート会場周辺の駅で、大型イベント再開により利用者が回復している</li>
            <li>複数路線が乗り入れるターミナルで、乗り換え需要が底堅く推移している</li>
          </ul>
        </div>

        {/* まとめ */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>まとめ</h2>
          <p style={pStyle}>
            コロナ前後の回復率は、駅ごとの人流の質を見極める指標です。回復率が高い駅は、観光・商業・居住いずれかの需要が堅調であることを示しており、商圏分析やエリア選定において有用な判断材料になります。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            AreaScopeでは駅ごとの時系列データを確認できるため、コロナ前・コロナ中・最新年の推移を個別に把握できます。このランキングで気になった駅があれば、駅ページから詳細を確認してみてください。
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
