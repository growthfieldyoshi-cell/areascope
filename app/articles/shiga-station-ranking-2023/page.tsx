import { neon } from '@neondatabase/serverless';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '滋賀県の駅乗降者数ランキング｜主要駅TOP20',
  description: '滋賀県の駅乗降者数ランキングTOP20を掲載しています。',
  alternates: {
    canonical: 'https://areascope.jp/station-ranking/shiga',
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

export default async function ShigaStationRanking2023Page() {
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
      AND s.prefecture_slug = 'shiga'
    GROUP BY s.station_group_slug
    HAVING SUM(sp.passengers) IS NOT NULL
    ORDER BY passengers DESC NULLS LAST
    LIMIT 20
  `) as RankingRow[];

  return (
    <main style={{ background: '#0a0e1a', minHeight: '100vh', color: '#e8edf5', fontFamily: 'sans-serif' }}>
      <article style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 20px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '16px', lineHeight: 1.4 }}>
          滋賀県の駅<span style={{ color: '#00d4aa' }}>乗降者数</span>ランキング（{year}年）
        </h1>

        <p style={{ color: '#e8edf5', fontSize: '16px', lineHeight: 1.8, marginBottom: '12px', fontWeight: 600 }}>
          {year}年、滋賀県で最も利用者が多い駅は草津駅・南草津駅エリアです。
        </p>
        <p style={{ ...pStyle, marginBottom: '32px' }}>
          滋賀県は京阪神のベッドタウンとしてJR新快速沿線を中心に鉄道利用が活発です。国土交通省「国土数値情報」の{year}年データをもとに、滋賀県の駅別乗降者数ランキングTOP20と、上位駅の特徴・エリア分析への活用方法を解説します。最新の完全版ランキングは<Link href="/station-ranking/shiga" style={linkStyle}>滋賀県の駅乗降者数ランキング（全件）</Link>から確認できます。
        </p>

        {/* TOP20テーブル */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>滋賀県の駅乗降者数ランキングTOP20（{year}年）</h2>
          <p style={{ ...pStyle, marginBottom: '16px' }}>
            以下は{year}年の滋賀県における駅別乗降者数ランキングです。同じ駅名に複数路線がある場合は合算した数値です。
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
          <h2 style={h2Style}>なぜこの順位になるのか</h2>

          <div style={{ marginBottom: '16px' }}>
            <h3 style={h3Style}>草津駅の特徴</h3>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              <Link href="/station/kusatsu-shiga-kusatsushi" style={linkStyle}>草津駅</Link>はJR琵琶湖線と草津線の分岐点に位置し、大阪方面への通勤圏として高い利用者数を誇ります。新快速停車駅であり、京都・大阪へのアクセスが良好なため、ベッドタウンとしての需要が安定しています。
            </p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <h3 style={h3Style}>南草津の成長</h3>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              <Link href="/station/minamisoutsu-shiga-kusatsushi" style={linkStyle}>南草津駅</Link>は新快速停車駅となったことで利用者が急増した駅です。立命館大学びわこ・くさつキャンパスをはじめとした大学の集積もあり、通学需要も加わって利用者数が大きく伸びています。
            </p>
          </div>

          <div>
            <h3 style={h3Style}>滋賀県の鉄道利用の特徴</h3>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              滋賀県は京阪神のベッドタウンとしての性格が強く、JR新快速沿線に鉄道利用が集中しています。琵琶湖の南側を走る琵琶湖線沿線は特に通勤需要が高く、草津・守山・野洲といった駅が上位に並ぶ傾向があります。
            </p>
          </div>
        </div>

        {/* エリア解説 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>上位駅周辺のエリア特徴</h2>

          <div style={{ marginBottom: '16px' }}>
            <h3 style={h3Style}>湖南エリア（草津・守山・栗東）</h3>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              琵琶湖南部のエリアは大阪・京都への通勤利便性が高く、人口増加が続いています。新快速停車駅周辺はマンション開発が進み、若いファミリー層の流入が目立ちます。
            </p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <h3 style={h3Style}>大津エリア</h3>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              県庁所在地の大津市はJRと京阪電車が走り、京都への通勤拠点としての性格が強いエリアです。大津駅・膳所駅周辺は行政機能と住宅が共存しています。
            </p>
          </div>

          <div>
            <h3 style={h3Style}>住みやすさとのバランス</h3>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              乗降者数が多い＝住みやすいとは限りません。滋賀県では新快速停車駅から1〜2駅離れた駅周辺が家賃と利便性のバランスが取れやすい傾向があります。人口推移データと合わせて確認すると、居住需要の実態がより正確に把握できます。
            </p>
          </div>
        </div>

        {/* データの見方 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>乗降者数データの見方</h2>
          <p style={pStyle}>
            乗降者数は国土交通省「国土数値情報」に基づく{year}年のデータです。各鉄道事業者が独自に算出しており、事業者間で厳密な比較が難しい場合があります。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            AreaScopeでは各駅の時系列推移を確認できるため、コロナ前後の回復度合いや長期トレンドを把握するのにも活用できます。<Link href="/station-ranking/shiga" style={linkStyle}>滋賀県の駅ランキング（全件）</Link>では100位までの完全版を掲載しています。
          </p>
        </div>

        {/* まとめ */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>まとめ</h2>
          <p style={pStyle}>
            {year}年の滋賀県駅乗降者数ランキングでは、草津駅・南草津駅が上位を占めています。JR新快速沿線のベッドタウン需要が滋賀県の鉄道利用を支えており、京阪神への通勤利便性が駅の利用者数に直結しています。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            エリア選びにおいては、乗降者数の絶対値だけでなく、駅のタイプ（ターミナル型か住宅駅型か）と人口推移を合わせて判断することが重要です。AreaScopeでは駅ごとの詳細データと市区町村の人口推移を合わせて確認できます。
          </p>
        </div>

        <p style={{ color: '#6b7a99', fontSize: '13px', marginBottom: '24px' }}>
          全国の都道府県ランキング一覧は<Link href="/articles/prefecture-ranking" style={linkStyle}>都道府県別駅乗降者数ランキング一覧</Link>もご覧ください。
        </p>

        {/* CTA */}
        <div style={{ ...sectionStyle, textAlign: 'center' as const }}>
          <h2 style={{ ...h2Style, marginBottom: '12px' }}>滋賀県の駅データを詳しく見る</h2>
          <p style={{ color: '#6b7a99', fontSize: '13px', marginBottom: '16px' }}>
            気になる駅があれば、詳細データを確認してみてください。
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/station-ranking/shiga" style={{ display: 'inline-block', color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
              滋賀県の全駅ランキング
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
