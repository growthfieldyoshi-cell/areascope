import { neon } from '@neondatabase/serverless';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '兵庫県の駅乗降者数ランキング｜主要駅TOP20',
  description: '兵庫県の駅乗降者数ランキングTOP20を掲載しています。',
  alternates: {
    canonical: 'https://areascope.jp/station-ranking/hyogo',
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

export default async function HyogoStationRanking2023Page() {
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
      AND s.prefecture_slug = 'hyogo'
    GROUP BY s.station_group_slug
    HAVING SUM(sp.passengers) IS NOT NULL
    ORDER BY passengers DESC NULLS LAST
    LIMIT 20
  `) as RankingRow[];

  return (
    <main style={{ background: '#0a0e1a', minHeight: '100vh', color: '#e8edf5', fontFamily: 'sans-serif' }}>
      <article style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 20px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '16px', lineHeight: 1.4 }}>
          兵庫県の駅<span style={{ color: '#00d4aa' }}>乗降者数</span>ランキング（{year}年）
        </h1>

        <p style={{ color: '#e8edf5', fontSize: '16px', lineHeight: 1.8, marginBottom: '12px', fontWeight: 600 }}>
          {year}年、兵庫県で最も利用者が多い駅は三ノ宮・神戸三宮エリアです。
        </p>
        <p style={{ ...pStyle, marginBottom: '32px' }}>
          兵庫県にはJR・阪急・阪神・地下鉄が集中する神戸の主要駅が並んでいます。国土交通省「国土数値情報」の{year}年データをもとに、兵庫県の駅別乗降者数ランキングTOP20と、上位駅の特徴・エリア分析への活用方法を解説します。最新の完全版ランキングは<Link href="/station-ranking/hyogo" style={linkStyle}>兵庫県の駅乗降者数ランキング（全件）</Link>から確認できます。
        </p>

        {/* TOP20テーブル */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>兵庫県の駅乗降者数ランキングTOP20（{year}年）</h2>
          <p style={{ ...pStyle, marginBottom: '16px' }}>
            以下は{year}年の兵庫県における駅別乗降者数ランキングです。同じ駅名に複数路線がある場合は合算した数値です。
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
            <h3 style={h3Style}>三ノ宮・神戸三宮が上位の理由</h3>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              <Link href="/station/sannomiya-hyogo-koubeshi" style={linkStyle}>三ノ宮駅</Link>と<Link href="/station/koubesannomiya-hyogo-koubeshi" style={linkStyle}>神戸三宮駅</Link>は実質同一エリアにあり、JR・阪急・阪神・地下鉄が集中する神戸最大のターミナルです。複数事業者が乗り入れることで乗り換え需要が大きく、兵庫県内で圧倒的な乗降者数を記録しています。
            </p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <h3 style={h3Style}>神戸エリアの特徴</h3>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              神戸は三宮を中心としたコンパクトな商業圏が特徴です。大阪のような複数の巨大ターミナルが分散する構造ではなく、三宮エリアに商業・交通機能が集約されています。そのため、三宮周辺の駅に利用者が集中する傾向があります。
            </p>
          </div>

          <div>
            <h3 style={h3Style}>住みやすさのバランス</h3>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              阪急沿線の住宅地が人気を集めています。阪急神戸線沿線は落ち着いた住環境と大阪・神戸への利便性を兼ね備えており、居住エリアとしての評価が高い傾向があります。乗降者数と人口推移を合わせて確認すると、住みやすさの実態がより正確に把握できます。
            </p>
          </div>
        </div>

        {/* エリア解説 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>上位駅周辺のエリア特徴</h2>

          <div style={{ marginBottom: '16px' }}>
            <h3 style={h3Style}>ターミナル駅周辺（三宮・元町）</h3>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              三宮・元町周辺は交通利便性が高く商業施設も充実していますが、家賃水準も高い傾向があります。繁華街としての性格が強く、住環境としては好みが分かれるエリアです。
            </p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <h3 style={h3Style}>阪急沿線の住宅地</h3>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              阪急神戸線・今津線沿線は、閑静な住宅地が広がり生活利便性も高いエリアです。西宮北口や夙川など、乗降者数は中規模ながら住みやすさの評価が高い駅が多く見られます。
            </p>
          </div>

          <div>
            <h3 style={h3Style}>郊外エリアの特徴</h3>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              乗降者数が多い＝住みやすいとは限りません。ターミナル駅から少し離れた中規模駅周辺がコストと利便性のバランスが取れやすい傾向があります。人口推移データと合わせて確認すると、居住需要の実態がより正確に把握できます。
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
            AreaScopeでは各駅の時系列推移を確認できるため、コロナ前後の回復度合いや長期トレンドを把握するのにも活用できます。<Link href="/station-ranking/hyogo" style={linkStyle}>兵庫県の駅ランキング（全件）</Link>では100位までの完全版を掲載しています。
          </p>
        </div>

        {/* まとめ */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>まとめ</h2>
          <p style={pStyle}>
            {year}年の兵庫県駅乗降者数ランキングでは、三ノ宮・神戸三宮エリアが突出した利用者数を記録しています。JR・阪急・阪神・地下鉄が集中するターミナルであることが乗降者数の多さに直結しています。
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
          <h2 style={{ ...h2Style, marginBottom: '12px' }}>兵庫県の駅データを詳しく見る</h2>
          <p style={{ color: '#6b7a99', fontSize: '13px', marginBottom: '16px' }}>
            気になる駅があれば、詳細データを確認してみてください。
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/station-ranking/hyogo" style={{ display: 'inline-block', color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
              兵庫県の全駅ランキング
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
