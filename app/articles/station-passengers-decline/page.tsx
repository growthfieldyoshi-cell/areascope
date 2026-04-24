import { Metadata } from 'next';
import { neon } from '@neondatabase/serverless';
import Link from 'next/link';
import Breadcrumb from '@/components/Breadcrumb';

const sql = neon(process.env.DATABASE_URL!);

const metaTitle = '乗降者数が減っている駅ランキング【最新】｜前年比で利用者が減った駅TOP20';
const metaDescription =
  '前年比で乗降者数が減っている駅ランキングTOP20を掲載。最新データをもとに、利用者数の減少が目立つ駅を紹介し、見方や注意点、回復率や全国ランキングとの比較導線もまとめています。';
const canonicalUrl = 'https://areascope.jp/articles/station-passengers-decline';

export const metadata: Metadata = {
  title: metaTitle,
  description: metaDescription,
  alternates: { canonical: canonicalUrl },
  openGraph: {
    type: 'website',
    title: metaTitle,
    description: metaDescription,
    url: canonicalUrl,
    siteName: 'AreaScope',
  },
};

type DeclineRow = {
  station_group_slug: string;
  station_name: string;
  prefecture_name: string;
  passengers_prev: number;
  passengers_latest: number;
  change: number;
  change_rate: number;
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

const h3Style = {
  fontSize: '16px',
  fontWeight: 700 as const,
  color: '#e8edf5',
  marginTop: '18px',
  marginBottom: '8px',
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

const linkButtonStyle = {
  display: 'inline-block',
  color: '#00d4aa',
  border: '1px solid #00d4aa',
  borderRadius: '6px',
  padding: '10px 20px',
  textDecoration: 'none',
  fontSize: '14px',
  fontWeight: 700 as const,
};

async function getLatestYear(): Promise<number> {
  const rows = await sql`SELECT MAX(year) AS year FROM station_passengers`;
  return Number(rows[0]?.year) || 2023;
}

export default async function StationPassengersDeclinePage() {
  const latestYear = await getLatestYear();
  const prevYear = latestYear - 1;

  const rows = (await sql`
    SELECT
      s.station_group_slug,
      MAX(s.station_name) AS station_name,
      MAX(s.prefecture_name) AS prefecture_name,
      CAST(SUM(CASE WHEN sp.year = ${prevYear}   THEN sp.passengers ELSE 0 END) AS bigint) AS passengers_prev,
      CAST(SUM(CASE WHEN sp.year = ${latestYear} THEN sp.passengers ELSE 0 END) AS bigint) AS passengers_latest,
      CAST(
        SUM(CASE WHEN sp.year = ${latestYear} THEN sp.passengers ELSE 0 END)
        - SUM(CASE WHEN sp.year = ${prevYear}   THEN sp.passengers ELSE 0 END)
      AS bigint) AS change,
      ROUND(
        (SUM(CASE WHEN sp.year = ${latestYear} THEN sp.passengers ELSE 0 END)::numeric
         - SUM(CASE WHEN sp.year = ${prevYear} THEN sp.passengers ELSE 0 END)::numeric)
        / NULLIF(SUM(CASE WHEN sp.year = ${prevYear} THEN sp.passengers ELSE 0 END)::numeric, 0)
        * 100,
        1
      ) AS change_rate
    FROM stations s
    INNER JOIN station_passengers sp
      ON s.station_key = sp.station_key
      AND sp.year IN (${prevYear}, ${latestYear})
    WHERE s.station_group_slug IS NOT NULL
    GROUP BY s.station_group_slug
    HAVING
      SUM(CASE WHEN sp.year = ${prevYear}   THEN sp.passengers END) IS NOT NULL
      AND SUM(CASE WHEN sp.year = ${latestYear} THEN sp.passengers END) IS NOT NULL
      AND SUM(CASE WHEN sp.year = ${prevYear}   THEN sp.passengers ELSE 0 END) > 0
      AND SUM(CASE WHEN sp.year = ${latestYear} THEN sp.passengers ELSE 0 END) > 0
      AND SUM(CASE WHEN sp.year = ${latestYear} THEN sp.passengers ELSE 0 END)
        - SUM(CASE WHEN sp.year = ${prevYear}   THEN sp.passengers ELSE 0 END) < 0
    ORDER BY change ASC
    LIMIT 20
  `) as DeclineRow[];

  return (
    <main style={{ background: '#0a0e1a', minHeight: '100vh', color: '#e8edf5', fontFamily: 'sans-serif' }}>
      <article style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 20px' }}>
        <Breadcrumb
          items={[
            { label: 'TOP', href: '/' },
            { label: '記事一覧', href: '/articles' },
            { label: '乗降者数が減っている駅ランキング' },
          ]}
        />

        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '16px', lineHeight: 1.4 }}>
          乗降者数が<span style={{ color: '#00d4aa' }}>減っている駅</span>ランキング
        </h1>

        <p style={{ color: '#e8edf5', fontSize: '16px', lineHeight: 1.8, marginBottom: '12px', fontWeight: 600 }}>
          {prevYear}年から{latestYear}年にかけて、乗降者数の減少数が大きかった駅TOP20を掲載します。
        </p>
        <p style={{ ...pStyle, marginBottom: '32px' }}>
          本記事は、前年比で利用者数が減少した駅のランキング本体ページです。
          国土交通省「国土数値情報（駅別乗降客数データ）」をもとに、
          {prevYear}年と{latestYear}年の両方にデータがある駅のうち、減少数が大きかった順に並べています。
          同じ駅名・同じ駅構内で複数路線が乗り入れている場合は合算しています。
        </p>

        {/* TOP20 テーブル */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>
            乗降者数減少ランキングTOP20（{prevYear}年→{latestYear}年）
          </h2>

          {rows.length === 0 ? (
            <p style={{ ...pStyle, marginBottom: 0 }}>
              {prevYear}年と{latestYear}年の両方のデータが揃っている駅で、減少している駅は見つかりませんでした。
            </p>
          ) : (
            <>
              <p style={{ ...pStyle, marginBottom: '16px' }}>
                減少数が大きかった駅の上位20駅です。駅名をタップすると、その駅の年別推移ページへ移動します。
              </p>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #1e2d45' }}>
                      {['順位', '駅名', '都道府県', `${prevYear}年`, `${latestYear}年`, '減少数', '前年比'].map((h) => (
                        <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: '#aaa', whiteSpace: 'nowrap' }}>
                          {h}
                        </th>
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
                          {Number(row.passengers_prev).toLocaleString()}人
                        </td>
                        <td style={{ padding: '10px 16px', whiteSpace: 'nowrap' }}>
                          {Number(row.passengers_latest).toLocaleString()}人
                        </td>
                        <td style={{ padding: '10px 16px', color: '#ff7070', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                          {Number(row.change).toLocaleString()}人
                        </td>
                        <td style={{ padding: '10px 16px', color: '#ff7070', whiteSpace: 'nowrap' }}>
                          {row.change_rate != null ? `${Number(row.change_rate).toFixed(1)}%` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p style={{ color: '#6b7a99', fontSize: '12px', marginTop: '14px', marginBottom: 0 }}>
                数値は年間乗降者数の合計値（乗車数＋降車数）です。複数路線が乗り入れる駅は合算しています。
              </p>
            </>
          )}
        </div>

        {/* ランキングの見方 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>減少ランキングの見方</h2>

          <h3 style={h3Style}>大規模駅ほど減少幅が大きく見えやすい</h3>
          <p style={pStyle}>
            もともと利用者数が多いターミナル駅は、同じ減少率でも絶対値の減少数が大きく出ます。
            上位が大規模駅で占められること自体は珍しくなく、減少数の大きさ＝深刻度とは限りません。
            小規模駅と比較する際は、前年比率（％）も合わせて確認するとより正確に読めます。
          </p>

          <h3 style={h3Style}>一時的要因と構造的要因を分ける</h3>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            減少の背景には、工事や路線改良・ダイヤ変更などの一時的要因と、人口減少や通勤需要の縮小などの構造的要因があります。
            1年の減少だけで駅やエリアの衰退と結論づけず、数年の推移と合わせて読み解く視点が重要です。
            指標の読み方については
            <Link href="/articles/station-passengers-ranking-japan" style={linkStyle}>
              駅乗降者数ランキングの読み方と活用方法
            </Link>
            もあわせて参照できます。
          </p>
        </div>

        {/* 注意点 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>このランキングを読むときの注意点</h2>

          <h3 style={h3Style}>1. 工事・路線変更・一時閉鎖・イベント反動</h3>
          <p style={pStyle}>
            駅の改良工事や路線ダイヤの改正、仮駅舎への切り替え、近隣路線の開業などが原因で、一時的に乗降者数が落ちることがあります。
            また前年に大型イベント・博覧会・再開発オープンなどの特需があった駅は、翌年その反動で大きな減少が出るケースも見られます。
            こうした要因は構造的な衰退ではありません。
          </p>

          <h3 style={h3Style}>2. 1年だけの変化で衰退と断定しない</h3>
          <p style={pStyle}>
            1年分の増減はダイヤ改正・気象・単発イベントなどで振れやすいため、減少をそのままエリアの衰退と結びつけるのは危険です。
            複数年の推移を確認し、「継続して減っているか」「特定年だけの下振れか」を区別する視点が必要です。
          </p>

          <h3 style={h3Style}>3. 回復率・全国ランキングと合わせて見る</h3>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            減少している駅でも、コロナ前（2019年）と比べればまだ戻っていない過程にあるケースがあります。
            <Link href="/articles/station-passenger-recovery-analysis" style={linkStyle}>
              駅乗降者数の回復率ランキング
            </Link>
            で2019年比の回復度合いを確認すると、構造的減少なのか回復途上なのかの判断に役立ちます。
            対となる
            <Link href="/articles/station-passengers-growth-2023" style={linkStyle}>
              乗降者数が増えた駅ランキング
            </Link>
            や
            <Link href="/station-ranking" style={linkStyle}>全国駅ランキング</Link>
            も合わせて確認すると、駅の位置づけを立体的に捉えられます。
          </p>
        </div>

        {/* 関連ページ */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>関連ページ・関連解説</h2>
          <ul style={{ ...pStyle, marginBottom: 0, paddingLeft: '20px', listStyle: 'disc' }}>
            <li style={{ marginBottom: '6px' }}>
              <Link href="/articles/station-passengers-growth-2023" style={linkStyle}>
                乗降者数が最も増えた駅ランキング
              </Link>
              ： 対になる増加ランキング本体
            </li>
            <li style={{ marginBottom: '6px' }}>
              <Link href="/articles/station-passenger-recovery-analysis" style={linkStyle}>
                駅乗降者数の回復率ランキング
              </Link>
              ： 2019年比でどこまで戻っているか
            </li>
            <li style={{ marginBottom: '6px' }}>
              <Link href="/articles/station-passengers-ranking-japan" style={linkStyle}>
                駅乗降者数ランキングの読み方と活用方法
              </Link>
              ： 指標そのものの見方
            </li>
            <li style={{ marginBottom: '6px' }}>
              <Link href="/articles/how-to-read-station-passengers-growth-ranking" style={linkStyle}>
                乗降者数が増えている駅ランキングの見方
              </Link>
              ： 増加軸での読み方（対になる解説）
            </li>
            <li>
              <Link href="/station-ranking" style={linkStyle}>
                全国駅ランキング
              </Link>
              ： 各駅の時系列データはこちらから
            </li>
          </ul>
        </div>

        {/* まとめ */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>まとめ</h2>
          <p style={pStyle}>
            {prevYear}年から{latestYear}年にかけて、乗降者数が前年比で減少した駅を減少数順にまとめました。
            大規模駅ほど減少数は大きく見えやすく、また一時的な工事・ダイヤ改正・イベント反動で数字が動くこともあるため、
            順位の数字だけで駅の衰退を判断するのは避けるのが安全です。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            構造的な変化かどうかを見極めるには、コロナ前比の回復率や、増加駅との対比、時系列の推移を合わせて確認するのが有効です。
            気になる駅があれば
            <Link href="/station-ranking" style={linkStyle}>全国駅ランキング</Link>
            の各駅ページから年別推移をチェックしてみてください。
          </p>
        </div>

        {/* CTA */}
        <div style={{ ...sectionStyle, textAlign: 'center' as const }}>
          <h2 style={{ ...h2Style, marginBottom: '12px' }}>関連データを見る</h2>
          <p style={{ color: '#6b7a99', fontSize: '13px', marginBottom: '16px' }}>
            減少と増加の両面、コロナ前比の回復度合いも合わせて確認できます。
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/articles/station-passengers-growth-2023" style={linkButtonStyle}>
              増加ランキング本体
            </Link>
            <Link href="/articles/station-passenger-recovery-analysis" style={linkButtonStyle}>
              回復率ランキング
            </Link>
            <Link href="/station-ranking" style={linkButtonStyle}>
              全国駅ランキング
            </Link>
            <Link href="/articles/station-passengers-ranking-japan" style={linkButtonStyle}>
              駅ランキングの見方
            </Link>
            <Link href="/articles/how-to-read-station-passengers-growth-ranking" style={linkButtonStyle}>
              増加ランキングの見方
            </Link>
            <Link href="/articles" style={linkButtonStyle}>
              他の記事を見る
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}
