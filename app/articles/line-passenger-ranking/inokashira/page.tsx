import { Metadata } from 'next';
import { neon } from '@neondatabase/serverless';
import Link from 'next/link';

const sql = neon(process.env.DATABASE_URL!);

export const metadata: Metadata = {
  title: '京王井の頭線の駅乗降者数ランキング｜AreaScope',
  description: '京王井の頭線の駅乗降者数ランキングを掲載。利用者数が多い駅や井の頭線の人の流れをデータで確認できます。',
  alternates: {
    canonical: 'https://areascope.jp/articles/line-passenger-ranking/inokashira',
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
  passengers: number;
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

/* 既存 LINE_MAP と完全一致: keio-inokashira */
const LINE_NAME = '京王井の頭線';
const OPERATOR_NAME = '京王電鉄';
const DISPLAY_NAME = '京王井の頭線';

export default async function InokashiraPassengerRankingPage() {
  const latestYear = await getLatestYear();

  const rows = (await sql`
    SELECT
      s.station_group_slug,
      MAX(s.station_name) AS station_name,
      MAX(s.prefecture_name) AS prefecture_name,
      CAST(SUM(sp.passengers) AS bigint) AS passengers
    FROM stations s
    INNER JOIN station_passengers sp
      ON s.station_key = sp.station_key
      AND sp.year = ${latestYear}
    WHERE s.station_group_slug IS NOT NULL
      AND s.line_name = ${LINE_NAME}
      AND s.operator_name = ${OPERATOR_NAME}
      AND sp.passengers > 0
    GROUP BY s.station_group_slug
    HAVING SUM(sp.passengers) > 0
    ORDER BY passengers DESC
    LIMIT 50
  `) as RankingRow[];

  return (
    <main style={{ background: '#0a0e1a', minHeight: '100vh', color: '#e8edf5', fontFamily: 'sans-serif' }}>
      <article style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 20px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '16px', lineHeight: 1.4 }}>
          {DISPLAY_NAME}の駅<span style={{ color: '#00d4aa' }}>乗降者数</span>ランキング
        </h1>

        <p style={{ color: '#e8edf5', fontSize: '16px', lineHeight: 1.8, marginBottom: '12px', fontWeight: 600 }}>
          {DISPLAY_NAME}の駅を乗降者数順にランキングしました。
        </p>
        <p style={{ ...pStyle, marginBottom: '32px' }}>
          国土交通省「国土数値情報」の{latestYear}年データをもとに、{DISPLAY_NAME}（{OPERATOR_NAME}）の各駅の乗降者数を比較しています。同じ駅名で複数路線がある場合は合算した数値です。{DISPLAY_NAME}の中でどの駅に人が集まっているかをデータで確認できます。
        </p>

        {/* ランキングテーブル */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>{DISPLAY_NAME}の駅乗降者数ランキング（{latestYear}年）</h2>
          <p style={{ ...pStyle, marginBottom: '16px' }}>
            乗降者数が多い駅から順に掲載しています。
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #1e2d45' }}>
                  {['順位', '駅名', '都道府県', `乗降者数（${latestYear}年）`].map((h) => (
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* このランキングの見方 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>このランキングの見方</h2>
          <p style={pStyle}>
            乗降者数とは、1日あたりに駅で乗車・降車した人数の合計です。同じ駅名で複数路線が乗り入れている場合は、全路線の乗降者数を合算しています。
          </p>
          <p style={pStyle}>
            乗降者数が多い駅ほど、その駅を中心とした人の流れが大きいことを意味します。通勤・通学・買い物など、日常的な移動の拠点となっている駅が上位に入ります。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            {DISPLAY_NAME}では、渋谷・吉祥寺など他路線との乗換駅や、商業集積が大きいエリアの駅が上位に入りやすい傾向があります。
          </p>
        </div>

        {/* 利用者が多い駅の特徴 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>{DISPLAY_NAME}で利用者が多い駅の特徴</h2>
          <ul style={{ color: '#aaa', fontSize: '15px', lineHeight: 2.2, paddingLeft: '20px', marginBottom: 0 }}>
            <li>渋谷・吉祥寺など、複数路線との乗換需要が大きいターミナル駅が上位に入る</li>
            <li>商業施設や飲食店が集積するエリアの駅は、買い物・外出需要で利用者が多い</li>
            <li>沿線の住宅地として人気のエリアでは、通勤・通学の需要が安定している</li>
            <li>下北沢など文化的な集客力を持つ駅は、沿線の中間駅でも利用者数が大きい</li>
            <li>急行停車駅は各駅停車のみの駅に比べて利用者が集中しやすい</li>
          </ul>
        </div>

        {/* まとめ */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>まとめ</h2>
          <p style={pStyle}>
            {DISPLAY_NAME}は渋谷と吉祥寺を結ぶ路線であり、両端のターミナル駅と沿線の住宅地・商業地で利用者数に差があります。駅ごとの乗降者数を比較することで、路線内の人流構造が見えてきます。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            各駅の詳細ページでは時系列データも確認できるため、コロナ前後の変化や長期トレンドの把握にも活用できます。都道府県別のランキングと合わせて確認すると、より立体的なエリア分析が可能です。
          </p>
        </div>

        {/* 関連データを見る */}
        <div style={{ ...sectionStyle, textAlign: 'center' as const }}>
          <h2 style={{ ...h2Style, marginBottom: '12px' }}>関連データを見る</h2>
          <p style={{ color: '#6b7a99', fontSize: '13px', marginBottom: '16px' }}>
            {DISPLAY_NAME}以外の路線や、全国の駅データも確認できます。
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/articles/passenger-analysis" style={{ display: 'inline-block', color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
              人流分析の記事一覧
            </Link>
            <Link href="/station-ranking" style={{ display: 'inline-block', color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
              全国駅ランキング
            </Link>
            <Link href="/articles/prefecture-rankings" style={{ display: 'inline-block', color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
              都道府県別ランキング一覧
            </Link>
            <Link href="/line/keio-inokashira" style={{ display: 'inline-block', color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
              {DISPLAY_NAME}の駅一覧
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}
