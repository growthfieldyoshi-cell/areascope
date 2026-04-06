import { Metadata } from 'next';
import { neon } from '@neondatabase/serverless';
import Link from 'next/link';

const sql = neon(process.env.DATABASE_URL!);

export const metadata: Metadata = {
  title: '山手線の駅乗降者数ランキング｜AreaScope',
  description: '山手線の駅乗降者数ランキングを掲載。利用者数が多い駅や山手線の人の流れをデータで確認できます。',
  alternates: {
    canonical: 'https://areascope.jp/articles/line-passenger-ranking/yamanote',
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

const LINE_NAME = '山手線';
const OPERATOR_NAME = '東日本旅客鉄道';

export default async function YamanotePassengerRankingPage() {
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
          山手線の駅<span style={{ color: '#00d4aa' }}>乗降者数</span>ランキング
        </h1>

        <p style={{ color: '#e8edf5', fontSize: '16px', lineHeight: 1.8, marginBottom: '12px', fontWeight: 600 }}>
          山手線の駅を乗降者数順にランキングしました。
        </p>
        <p style={{ ...pStyle, marginBottom: '32px' }}>
          国土交通省「国土数値情報」の{latestYear}年データをもとに、山手線（東日本旅客鉄道）の各駅の乗降者数を比較しています。同じ駅名で複数路線がある場合は合算した数値です。山手線の中でどの駅に人が集まっているかをデータで確認できます。
        </p>

        {/* ランキングテーブル */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>山手線の駅乗降者数ランキング（{latestYear}年）</h2>
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
            乗降者数が多い駅ほど、その駅を中心とした人の流れが大きいことを意味します。通勤・通学・買い物・観光など、さまざまな目的で駅が利用されています。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            山手線では、複数路線が乗り入れるターミナル駅や、オフィス・商業施設が集積するエリアの駅が上位に入りやすい傾向があります。
          </p>
        </div>

        {/* 利用者が多い駅の特徴 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>山手線で利用者が多い駅の特徴</h2>
          <ul style={{ color: '#aaa', fontSize: '15px', lineHeight: 2.2, paddingLeft: '20px', marginBottom: 0 }}>
            <li>新宿・渋谷・池袋など、複数路線が集まるターミナル駅が圧倒的に利用者が多い</li>
            <li>東京・品川など、新幹線や在来線との乗換需要が大きい駅が上位に入る</li>
            <li>商業施設やオフィスが集積する駅は、通勤・買い物需要で利用者数が伸びやすい</li>
            <li>山手線内でも、住宅地寄りの駅と商業地寄りの駅で利用者規模に大きな差がある</li>
            <li>コロナ後の回復率も駅ごとに異なり、観光・商業需要が強い駅ほど回復が早い傾向がある</li>
          </ul>
        </div>

        {/* まとめ */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>まとめ</h2>
          <p style={pStyle}>
            山手線は東京の主要エリアを環状に結ぶ路線であり、駅ごとの乗降者数の差は路線内の人流構造を反映しています。ターミナル駅の圧倒的な利用者数と、住宅地寄りの駅の落ち着いた利用者数の対比が特徴です。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            各駅の詳細ページでは時系列データも確認できるため、コロナ前後の変化や長期トレンドの把握にも活用できます。都道府県別のランキングと合わせて確認すると、より立体的なエリア分析が可能です。
          </p>
        </div>

        {/* 関連データを見る */}
        <div style={{ ...sectionStyle, textAlign: 'center' as const }}>
          <h2 style={{ ...h2Style, marginBottom: '12px' }}>関連データを見る</h2>
          <p style={{ color: '#6b7a99', fontSize: '13px', marginBottom: '16px' }}>
            山手線以外の路線や、全国の駅データも確認できます。
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
            <Link href="/line/yamanote" style={{ display: 'inline-block', color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
              山手線の駅一覧
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}
