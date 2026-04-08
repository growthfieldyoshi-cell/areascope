import { neon } from '@neondatabase/serverless';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '沖縄県の駅乗降者数ランキング｜主要駅TOP20',
  description: '沖縄県の駅乗降者数ランキングTOP20を掲載しています。',
  alternates: {
    canonical: 'https://areascope.jp/station-ranking/okinawa',
  },
};


const sql = neon(process.env.DATABASE_URL!);

async function getLatestYear(): Promise<number> {
  const rows = await sql`SELECT MAX(year) AS year FROM station_passengers`;
  return rows[0]?.year ?? 2021;
}

type RankingRow = {
  station_group_slug: string;
  station_name: string;
  municipality_name: string;
  line_name: string;
  operator_name: string;
  passengers: number | null;
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
  marginBottom: '10px',
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

export default async function OkinawaStationRanking2023Page() {
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
      AND s.prefecture_slug = 'okinawa'
    GROUP BY s.station_group_slug
    HAVING SUM(sp.passengers) IS NOT NULL
    ORDER BY passengers DESC NULLS LAST
    LIMIT 20
  `) as RankingRow[];

  return (
    <main style={{ background: '#0a0e1a', minHeight: '100vh', color: '#e8edf5', fontFamily: 'sans-serif' }}>
      <article style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 20px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '16px', lineHeight: 1.4 }}>
          沖縄県の駅<span style={{ color: '#00d4aa' }}>乗降者数</span>ランキング（{year}年）
        </h1>

        <p style={{ color: '#e8edf5', fontSize: '16px', lineHeight: 1.8, marginBottom: '12px', fontWeight: 600 }}>
          沖縄県の鉄道はゆいレール（沖縄都市モノレール）のみ。県内全駅のランキングを掲載しています。
        </p>
        <p style={{ ...pStyle, marginBottom: '32px' }}>
          沖縄県は全国で唯一、JR路線がない都道府県です。公共交通はゆいレール（那覇空港〜てだこ浦西）が唯一の軌道系交通機関であり、駅数も限られています。国土交通省「国土数値情報」の{year}年データをもとに、沖縄県の駅別乗降者数ランキングと各駅の特徴を解説します。最新の完全版ランキングは<Link href="/station-ranking/okinawa" style={linkStyle}>沖縄県の駅乗降者数ランキング（全件）</Link>から確認できます。
        </p>

        {/* TOP20テーブル */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>沖縄県の駅乗降者数ランキング（{year}年）</h2>
          <p style={{ ...pStyle, marginBottom: '16px' }}>
            以下は{year}年の沖縄県における駅別乗降者数ランキングです。すべてゆいレールの駅です。
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #1e2d45' }}>
                  {['順位', '駅名', '所在地', `乗降者数（${year}年）`, ''].map((h) => (
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
        </div>

        {/* 分析 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>沖縄県の主要駅の特徴</h2>

          <div style={{ marginBottom: '16px' }}>
            <h3 style={h3Style}>おもろまち駅</h3>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              <Link href="/station/omoromachi-okinawa-nahashi" style={linkStyle}>おもろまち駅</Link>は那覇新都心の中心に位置し、DFSギャラリアや大型商業施設が隣接しています。観光客と地元住民の両方の利用が多く、沖縄県内でトップクラスの乗降者数を記録する傾向があります。
            </p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <h3 style={h3Style}>県庁前駅</h3>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              <Link href="/station/kenchoumae-okinawa-nahashi" style={linkStyle}>県庁前駅</Link>は沖縄県庁と那覇市役所の最寄り駅であり、国際通りの入口にも近い立地です。行政需要と観光需要が重なるため、安定した乗降者数を維持しています。
            </p>
          </div>

          <div>
            <h3 style={h3Style}>那覇空港駅と観光需要</h3>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              那覇空港駅はゆいレールの起点であり、観光客の利用が集中します。沖縄県の駅利用は観光シーズンに大きく変動する傾向があり、本土の通勤型駅とは利用パターンが異なる点が特徴です。
            </p>
          </div>
        </div>

        {/* エリア解説 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>沖縄県の交通事情とエリア特徴</h2>

          <div style={{ marginBottom: '16px' }}>
            <h3 style={h3Style}>ゆいレール沿線の特徴</h3>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              ゆいレールは那覇空港からてだこ浦西まで約17kmを結ぶモノレールです。那覇市中心部の移動手段として定着しており、延伸後は浦添市方面への通勤・通学にも利用されています。沿線は那覇市の主要な商業地・住宅地をカバーしています。
            </p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <h3 style={h3Style}>車社会との関係</h3>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              沖縄県は全国有数の車社会であり、ゆいレール沿線以外の移動は車が中心です。そのため駅の乗降者数は本土の都市に比べて全体的に少ないですが、那覇市中心部では鉄道が重要な移動手段として機能しています。
            </p>
          </div>

          <div>
            <h3 style={h3Style}>住みやすさの視点</h3>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              ゆいレール沿線は車がなくても生活できるエリアとして、移住者にも注目されています。特に新都心エリアやおもろまち周辺は商業施設が充実しており、生活利便性が高い傾向があります。
            </p>
          </div>
        </div>

        {/* データの見方 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>乗降者数データの見方</h2>
          <p style={pStyle}>
            乗降者数は国土交通省「国土数値情報」に基づく{year}年のデータです。沖縄県はゆいレールのみのデータとなるため、他県と単純比較する際には注意が必要です。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            AreaScopeでは各駅の時系列推移を確認できるため、延伸前後の変化や観光需要の回復度合いを把握するのにも活用できます。<Link href="/station-ranking/okinawa" style={linkStyle}>沖縄県の駅ランキング（全件）</Link>では全駅の完全版を掲載しています。
          </p>
        </div>

        {/* まとめ */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>まとめ</h2>
          <p style={pStyle}>
            沖縄県の鉄道はゆいレールのみですが、那覇市中心部では重要な移動手段として定着しています。おもろまちや県庁前など、商業・行政の中核エリアに位置する駅が上位に並ぶ傾向があります。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            沖縄のエリア選びでは、ゆいレール沿線かどうかが生活利便性を大きく左右します。人口推移と合わせて確認することで、那覇市内のエリアの実態をより正確に把握できます。
          </p>
        </div>

        <p style={{ color: '#6b7a99', fontSize: '13px', marginBottom: '24px' }}>
          全国の都道府県ランキング一覧は<Link href="/articles/prefecture-ranking" style={linkStyle}>都道府県別駅乗降者数ランキング一覧</Link>もご覧ください。
        </p>

        {/* CTA */}
        <div style={{ ...sectionStyle, textAlign: 'center' as const }}>
          <h2 style={{ ...h2Style, marginBottom: '12px' }}>沖縄県の駅データを詳しく見る</h2>
          <p style={{ color: '#6b7a99', fontSize: '13px', marginBottom: '16px' }}>
            気になる駅があれば、詳細データを確認してみてください。
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/station-ranking/okinawa" style={{ display: 'inline-block', color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
              沖縄県の全駅ランキング
            </Link>
            <Link href="/station/list" style={{ display: 'inline-block', color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
              駅一覧から探す
            </Link>
            <Link href="/city" style={{ display: 'inline-block', color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
              市区町村の人口推移
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
