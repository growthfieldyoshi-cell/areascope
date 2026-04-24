import { Metadata } from 'next';
import { neon } from '@neondatabase/serverless';
import Link from 'next/link';
import Breadcrumb from '@/components/Breadcrumb';

const sql = neon(process.env.DATABASE_URL!);

const metaTitle = '駅乗降者数ランキングの見方と活用方法｜全国・都道府県・路線別の使い分け';
const metaDescription =
  '駅の乗降者数ランキングをどう読むか、住みやすさや出店検討にどう活用するかを解説。全国・都道府県・路線ごとのランキングの使い分け、乗換駅や同一駅群の扱いなど注意点もまとめています。';
const canonicalUrl = 'https://areascope.jp/articles/station-passengers-ranking-japan';

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

type RankingRow = {
  station_group_slug: string;
  station_name: string;
  prefecture_name: string;
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

export default async function StationPassengersRankingJapanPage() {
  const year = await getLatestYear();

  const rows = (await sql`
    SELECT
      s.station_group_slug,
      MAX(s.station_name) AS station_name,
      MAX(s.prefecture_name) AS prefecture_name,
      MAX(s.municipality_name) AS municipality_name,
      MAX(s.line_name) AS line_name,
      MAX(s.operator_name) AS operator_name,
      CAST(SUM(sp.passengers) AS bigint) AS passengers
    FROM stations s
    INNER JOIN station_passengers sp
      ON s.station_key = sp.station_key
      AND sp.year = ${year}
    WHERE s.station_group_slug IS NOT NULL
    GROUP BY s.station_group_slug
    HAVING SUM(sp.passengers) IS NOT NULL
    ORDER BY passengers DESC
    LIMIT 5
  `) as RankingRow[];

  return (
    <main style={{ background: '#0a0e1a', minHeight: '100vh', color: '#e8edf5', fontFamily: 'sans-serif' }}>
      <article style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 20px' }}>
        <Breadcrumb
          items={[
            { label: 'TOP', href: '/' },
            { label: '記事一覧', href: '/articles' },
            { label: '駅乗降者数ランキングの見方と活用方法' },
          ]}
        />

        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '16px', lineHeight: 1.4 }}>
          駅の<span style={{ color: '#00d4aa' }}>乗降者数ランキング</span>の読み方と活用方法
        </h1>

        <p style={{ color: '#e8edf5', fontSize: '16px', lineHeight: 1.8, marginBottom: '12px', fontWeight: 600 }}>
          駅の乗降者数ランキングを「どう読むか・どう使い分けるか」を解説した記事です。
        </p>
        <p style={{ ...pStyle, marginBottom: '12px' }}>
          全国TOP100の一覧や都道府県絞り込みは
          <Link href="/station-ranking" style={linkStyle}>
            全国駅ランキング
          </Link>
          で提供しています。本記事はランキングそのものではなく、ランキング指標としての意味・注意点・活用方法の解説に特化しています。
        </p>
        <p style={{ ...pStyle, marginBottom: '32px' }}>
          データは国土交通省「国土数値情報（駅別乗降客数データ）」をもとに、{year}年の年間乗降者数を集計したものです。
          同じ駅名・同じ駅構内で複数路線が乗り入れている場合は合算しています。
        </p>

        {/* 参考例：上位駅 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>参考：最新の上位駅（{year}年・上位5駅）</h2>
          <p style={{ ...pStyle, marginBottom: '16px' }}>
            解説の前提として、最新データの上位5駅だけ掲載します。TOP100や都道府県別の一覧は
            <Link href="/station-ranking" style={linkStyle}>全国駅ランキング</Link>
            で確認してください。駅名をタップすると、その駅の年別推移ページへ移動します。
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #1e2d45' }}>
                  {['順位', '駅名', '都道府県', '市区町村', '乗降者数'].map((h) => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: '#aaa', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={row.station_group_slug} style={{ borderBottom: '1px solid #1e2d45' }}>
                    <td
                      style={{
                        padding: '10px 16px',
                        color: index < 3 ? '#00d4aa' : '#aaa',
                        fontWeight: index < 3 ? 'bold' : 'normal',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {index + 1}位
                    </td>
                    <td style={{ padding: '10px 16px', fontWeight: 'bold' }}>
                      <Link
                        href={`/station/${row.station_group_slug}`}
                        style={{ color: '#e8edf5', textDecoration: 'none' }}
                      >
                        {row.station_name}駅
                      </Link>
                    </td>
                    <td style={{ padding: '10px 16px', color: '#aaa', whiteSpace: 'nowrap' }}>{row.prefecture_name}</td>
                    <td style={{ padding: '10px 16px', color: '#aaa', whiteSpace: 'nowrap' }}>{row.municipality_name}</td>
                    <td style={{ padding: '10px 16px', color: '#00d4aa', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                      {row.passengers != null ? `${Number(row.passengers).toLocaleString()}人` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ color: '#6b7a99', fontSize: '12px', marginTop: '14px', marginBottom: 0 }}>
            数値は年間乗降者数の合計値（乗車数＋降車数）です。複数路線が乗り入れる駅は合算しています。
          </p>
        </div>

        {/* ランキングの見方 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>駅乗降者数ランキングの見方</h2>
          <p style={pStyle}>
            乗降者数ランキングは、その駅を「どれだけ多くの人が使っているか」を示すシンプルな指標です。
            数値が大きいほどターミナル性が高く、路線の結節点として機能していることを意味します。
          </p>
          <p style={pStyle}>
            一方で、乗降者数は「住む街としての人気度」や「住みやすさ」を直接表すものではありません。
            都心ターミナル型の駅は利用者が多くても昼間人口の影響が大きく、実際の住民数とは比例しません。
            居住エリアとして駅を評価したい場合は、同時に市区町村の人口推移や周辺人口密度も合わせて確認するのが有効です。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            個別駅の時系列データや周辺エリアとの関係性は、
            <Link href="/station-ranking" style={linkStyle}>
              全国駅ランキング
            </Link>
            の各駅ページから確認できます。
          </p>
        </div>

        {/* 注意点 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>ランキングを読むときの注意点</h2>
          <p style={pStyle}>
            <strong style={{ color: '#e8edf5' }}>1. 同一駅・同一駅群の扱い</strong>
            <br />
            新宿駅のように、JR・私鉄・地下鉄など複数の事業者が乗り入れる駅は、乗降者数が事業者ごとに計上されます。
            本記事では同じ駅構内と見なせるものを合算してランキング化しています。
            事業者単位でランキングを見たい場合は、元データを分けて確認する必要があります。
          </p>
          <p style={pStyle}>
            <strong style={{ color: '#e8edf5' }}>2. 乗換駅は数値が大きくなりやすい</strong>
            <br />
            乗降者数は「改札を通過した人数」ではなく、路線の乗車・降車を合算したものが公開されていることが多く、
            乗換駅は定義上、数値が大きくなりやすい傾向があります。純粋な「街に降りて活動する人数」とは別の指標として読むことをおすすめします。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            <strong style={{ color: '#e8edf5' }}>3. 欠損データと年度差</strong>
            <br />
            事業者によっては一部年度のデータが公開されていないケースがあります。本記事では最新年（{year}年）の
            データが揃っている駅のみを対象にランキング化していますが、路線や駅名検索で見つからない場合は元データ側の都合であり、
            エリアとしての重要性がないわけではありません。
          </p>
        </div>

        {/* 活用方法 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>駅乗降者数ランキングの活用方法</h2>
          <p style={pStyle}>
            引越し先や住まいを検討するときは、ランキング上位＝住みやすい、とは限らないことを意識すると判断がぶれにくくなります。
            大規模ターミナルは生活利便性が高い反面、混雑・騒音・賃料の高さがトレードオフになりがちです。
            <Link href="/articles/is-busy-station-livable" style={linkStyle}>
              駅の乗降者数が多い街は住みやすいのか？
            </Link>
            で、住宅駅型とターミナル駅型の違いを整理しています。
          </p>
          <p style={pStyle}>
            出店や立地検討の場面では、「誰がどこから来てどこへ降りるのか」を捉えることが重要です。
            たとえば乗降者数が多くても通過型の駅と滞在型の駅では周辺消費が大きく異なります。
            エリアの性格を掴むには、乗降者数だけでなく周辺市区町村の人口構造や昼夜間人口比率を重ねて見るのが有効です。
            この視点は
            <Link href="/articles/population-passengers-combination-analysis" style={linkStyle}>
              人口×駅利用のクロス分析
            </Link>
            で詳しく扱っています。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            トレンドを読みたい場合は、ランキング上位の駅ではなく
            <Link href="/articles/station-passengers-growth-2023" style={linkStyle}>
              乗降者数が最も増えた駅ランキング
            </Link>
            の方が参考になります。エリアの成長性はランキングの順位ではなく変化量に表れるためです。
          </p>
        </div>

        {/* 深掘り記事 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>都道府県別・テーマ別の深掘り記事</h2>
          <p style={{ ...pStyle, marginBottom: '16px' }}>
            全国ランキングは概況把握には適していますが、実際のエリア検討には都道府県内や路線単位の比較の方が役立ちます。以下から該当エリア・テーマに絞って確認できます。
          </p>
          <ul style={{ ...pStyle, marginBottom: 0, paddingLeft: '20px', listStyle: 'disc' }}>
            <li style={{ marginBottom: '6px' }}>
              <Link href="/articles/tokyo-station-ranking-2023" style={linkStyle}>
                東京都の駅乗降者数ランキングTOP100
              </Link>
              ： 新宿・渋谷・池袋ほか都内主要駅の比較
            </li>
            <li style={{ marginBottom: '6px' }}>
              <Link href="/articles/osaka-station-ranking-2023" style={linkStyle}>
                大阪府の駅乗降者数ランキングTOP100
              </Link>
              ： 梅田・難波・天王寺を中心とした関西の主要駅
            </li>
            <li style={{ marginBottom: '6px' }}>
              <Link href="/articles/kanagawa-station-ranking-2023" style={linkStyle}>
                神奈川県の駅乗降者数ランキングTOP100
              </Link>
              ： 横浜・武蔵小杉など通勤需要の強い駅
            </li>
            <li style={{ marginBottom: '6px' }}>
              <Link href="/articles/aichi-station-ranking-2023" style={linkStyle}>
                愛知県の駅乗降者数ランキングTOP100
              </Link>
              ： 名古屋・金山を中心とした中部圏主要駅
            </li>
            <li style={{ marginBottom: '6px' }}>
              <Link href="/articles/prefecture-ranking" style={linkStyle}>
                都道府県別の駅ランキング一覧
              </Link>
              ： 47都道府県すべての記事一覧
            </li>
            <li>
              <Link href="/articles/line-passenger-ranking/yamanote" style={linkStyle}>
                山手線の駅別乗降者数ランキング
              </Link>
              ： 路線単位での比較例
            </li>
          </ul>
        </div>

        {/* まとめ */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>まとめ</h2>
          <p style={pStyle}>
            全国の駅乗降者数ランキングは、どの駅がターミナルとして機能しているかを把握する出発点として有効です。
            ただし順位そのものは、住みやすさ・成長性・出店適性といった実用的な判断に直結するものではありません。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            「どの目的で駅を見たいのか」を決めたうえで、全国ランキング・都道府県ランキング・増加ランキング・路線別を使い分けると、
            エリア分析の解像度がぐっと上がります。気になる駅は
            <Link href="/station-ranking" style={linkStyle}>
              全国駅ランキング
            </Link>
            から時系列データまで確認してみてください。
          </p>
        </div>

        {/* 関連データ導線 */}
        <div style={{ ...sectionStyle, textAlign: 'center' as const }}>
          <h2 style={{ ...h2Style, marginBottom: '12px' }}>関連データを見る</h2>
          <p style={{ color: '#6b7a99', fontSize: '13px', marginBottom: '16px' }}>
            気になる駅やエリアがあれば、詳細データを確認してみてください。
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/station-ranking" style={linkButtonStyle}>
              全国駅ランキング（TOP100）
            </Link>
            <Link href="/articles/station-passengers-growth-2023" style={linkButtonStyle}>
              乗降者数が増えた駅ランキング
            </Link>
            <Link href="/articles/prefecture-ranking" style={linkButtonStyle}>
              都道府県別ランキング一覧
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
