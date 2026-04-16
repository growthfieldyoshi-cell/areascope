import { Metadata } from 'next';
import { neon } from '@neondatabase/serverless';
import Link from 'next/link';
import Breadcrumb from '@/components/Breadcrumb';

const sql = neon(process.env.DATABASE_URL!);

export const metadata: Metadata = {
  title: '乗降者数が最も増えた駅ランキング【最新】｜前年比',
  description: '2022年から2023年にかけて乗降者数が最も増加した駅TOP20をデータで紹介します。',
  alternates: {
    canonical: 'https://areascope.jp/articles/station-passengers-growth-2023',
  },
  openGraph: {
    type: 'website',
    title: '乗降者数が最も増えた駅ランキング【最新】｜前年比',
    description: '2022年から2023年にかけて乗降者数が最も増加した駅TOP20をデータで紹介します。',
    url: 'https://areascope.jp/articles/station-passengers-growth-2023',
    siteName: 'AreaScope',
  },
};

type GrowthRow = {
  station_group_slug: string;
  station_name: string;
  prefecture_name: string;
  passengers_2022: number;
  passengers_2023: number;
  growth: number;
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

export default async function StationPassengersGrowth2023Page() {
  const rows = (await sql`
    SELECT
      s.station_group_slug,
      MAX(s.station_name) AS station_name,
      MAX(s.prefecture_name) AS prefecture_name,
      CAST(SUM(CASE WHEN sp.year = 2022 THEN sp.passengers ELSE 0 END) AS bigint) AS passengers_2022,
      CAST(SUM(CASE WHEN sp.year = 2023 THEN sp.passengers ELSE 0 END) AS bigint) AS passengers_2023,
      CAST(
        SUM(CASE WHEN sp.year = 2023 THEN sp.passengers ELSE 0 END)
        - SUM(CASE WHEN sp.year = 2022 THEN sp.passengers ELSE 0 END)
      AS bigint) AS growth
    FROM stations s
    INNER JOIN station_passengers sp
      ON s.station_key = sp.station_key
      AND sp.year IN (2022, 2023)
    WHERE s.station_group_slug IS NOT NULL
    GROUP BY s.station_group_slug
    HAVING
      SUM(CASE WHEN sp.year = 2022 THEN sp.passengers END) IS NOT NULL
      AND SUM(CASE WHEN sp.year = 2023 THEN sp.passengers END) IS NOT NULL
      AND SUM(CASE WHEN sp.year = 2023 THEN sp.passengers ELSE 0 END)
        - SUM(CASE WHEN sp.year = 2022 THEN sp.passengers ELSE 0 END) > 0
    ORDER BY growth DESC
    LIMIT 20
  `) as GrowthRow[];

  return (
    <main style={{ background: '#0a0e1a', minHeight: '100vh', color: '#e8edf5', fontFamily: 'sans-serif' }}>
      <article style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 20px' }}>
        <Breadcrumb items={[
          { label: 'TOP', href: '/' },
          { label: '記事一覧', href: '/articles' },
          { label: '乗降者数が最も増えた駅ランキング' },
        ]} />
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '16px', lineHeight: 1.4 }}>
          2023年に乗降者数が最も<span style={{ color: '#00d4aa' }}>増えた駅</span>ランキング
        </h1>

        <p style={{ color: '#e8edf5', fontSize: '16px', lineHeight: 1.8, marginBottom: '12px', fontWeight: 600 }}>
          2022年から2023年にかけて、乗降者数が最も増加した駅をランキング形式で紹介します。
        </p>
        <p style={{ ...pStyle, marginBottom: '32px' }}>
          コロナ禍からの回復や再開発の進展により、多くの駅で利用者数が増加しています。国土交通省「国土数値情報」のデータをもとに、2022年と2023年の乗降者数を比較し、増加数が大きかったTOP20をまとめました。同じ駅名に複数路線がある場合は合算した数値です。
        </p>

        {/* TOP20テーブル */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>乗降者数増加ランキングTOP20（2022年→2023年）</h2>
          <p style={{ ...pStyle, marginBottom: '16px' }}>
            2022年から2023年にかけて乗降者数の増加数が大きかった駅の上位20駅です。
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #1e2d45' }}>
                  {['順位', '駅名', '都道府県', '2022年', '2023年', '増加数'].map((h) => (
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
                      {Number(row.passengers_2022).toLocaleString()}人
                    </td>
                    <td style={{ padding: '10px 16px', whiteSpace: 'nowrap' }}>
                      {Number(row.passengers_2023).toLocaleString()}人
                    </td>
                    <td style={{ padding: '10px 16px', color: '#00d4aa', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                      +{Number(row.growth).toLocaleString()}人
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 分析 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>なぜ乗降者数が増えた駅に注目すべきか</h2>
          <p style={pStyle}>
            乗降者数が増加している駅は、周辺エリアの活性化を示す重要な指標です。通勤・通学需要の回復だけでなく、再開発による新規居住者の増加や商業施設の集積が背景にあるケースも多く見られます。
          </p>
          <p style={pStyle}>
            特に増加数が大きい駅は、ターミナル駅としての回復力が強いか、エリア全体の成長が顕著であることを示しています。引越し先の検討や出店エリアの分析において、増加トレンドにある駅を把握しておくことは有効な判断材料になります。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            ただし、増加数の大きさはもともとの利用者規模にも依存します。大規模ターミナル駅は絶対数の増加が大きくなりやすいため、増加率も合わせて確認するとより正確な分析が可能です。各駅の時系列推移は<Link href="/station-ranking" style={linkStyle}>全国駅ランキング</Link>から個別に確認できます。
          </p>
        </div>

        {/* まとめ */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>まとめ</h2>
          <p style={pStyle}>
            2022年から2023年にかけて、多くの駅で乗降者数が増加しました。コロナ禍からの回復が進む中で、特に大都市圏のターミナル駅や再開発が進むエリアの駅で大きな増加が見られます。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            乗降者数の増減は、エリアの活力を測る上で重要な指標です。AreaScopeでは駅ごとの時系列データと市区町村の人口推移を合わせて確認できるため、より多角的なエリア分析が可能です。
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
            <Link href="/articles" style={{ display: 'inline-block', color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
              他の記事を見る
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}
