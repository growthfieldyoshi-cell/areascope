import { Metadata } from 'next';
import { neon } from '@neondatabase/serverless';
import Link from 'next/link';
import Breadcrumb from '@/components/Breadcrumb';

const sql = neon(process.env.DATABASE_URL!);

const metaTitle = '都道府県別駅乗降者数ランキングの見方｜都市規模・車社会度・観光要素での比較軸';
const metaDescription =
  '都道府県別の駅乗降者数ランキングをどう比較するかを解説。都市規模、車社会度、観光需要、ターミナル依存など、県ごとの違いを踏まえた読み方と注意点をまとめています。';
const canonicalUrl = 'https://areascope.jp/articles/how-to-read-prefecture-station-ranking';

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

type ExampleRow = {
  station_group_slug: string;
  station_name: string;
  municipality_name: string;
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

const linkChipStyle = {
  display: 'inline-block',
  color: '#e8edf5',
  background: '#0a0e1a',
  border: '1px solid #1e2d45',
  borderRadius: '4px',
  padding: '6px 12px',
  textDecoration: 'none',
  fontSize: '13px',
};

// 代表都道府県ランキング（/station-ranking/[slug] 本体と記事本体への両導線）
const PREF_LINKS: { slug: string; name: string; article: string; note: string }[] = [
  { slug: 'tokyo',    name: '東京都',   article: 'tokyo-station-ranking-2023',    note: 'ターミナル集中型' },
  { slug: 'osaka',    name: '大阪府',   article: 'osaka-station-ranking-2023',    note: '都市圏複数核型' },
  { slug: 'kanagawa', name: '神奈川県', article: 'kanagawa-station-ranking-2023', note: '通勤流入型' },
  { slug: 'aichi',    name: '愛知県',   article: 'aichi-station-ranking-2023',    note: '名古屋一極集中型' },
  { slug: 'fukuoka',  name: '福岡県',   article: 'fukuoka-station-ranking-2023',  note: '地方拠点都市型' },
  { slug: 'hokkaido', name: '北海道',   article: 'hokkaido-station-ranking-2023', note: '広域・車社会型' },
  { slug: 'kyoto',    name: '京都府',   article: 'kyoto-station-ranking-2023',    note: '観光需要型' },
  { slug: 'okinawa',  name: '沖縄県',   article: 'okinawa-station-ranking-2023',  note: '鉄道希少・観光型' },
];

async function getLatestYear(): Promise<number> {
  const rows = await sql`SELECT MAX(year) AS year FROM station_passengers`;
  return Number(rows[0]?.year) || 2023;
}

export default async function HowToReadPrefectureStationRankingPage() {
  const year = await getLatestYear();

  // 参考例：東京都の乗降者数TOP5（ランキング記事ではないため5件で打ち切り）
  const example = (await sql`
    SELECT
      s.station_group_slug,
      MAX(s.station_name) AS station_name,
      MAX(s.municipality_name) AS municipality_name,
      CAST(SUM(sp.passengers) AS bigint) AS passengers
    FROM stations s
    INNER JOIN station_passengers sp
      ON s.station_key = sp.station_key
      AND sp.year = ${year}
    WHERE s.station_group_slug IS NOT NULL
      AND s.prefecture_slug = 'tokyo'
      AND sp.passengers > 0
    GROUP BY s.station_group_slug
    HAVING SUM(sp.passengers) > 0
    ORDER BY passengers DESC
    LIMIT 5
  `) as ExampleRow[];

  return (
    <main style={{ background: '#0a0e1a', minHeight: '100vh', color: '#e8edf5', fontFamily: 'sans-serif' }}>
      <article style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 20px' }}>
        <Breadcrumb
          items={[
            { label: 'TOP', href: '/' },
            { label: '記事一覧', href: '/articles' },
            { label: '都道府県別駅乗降者数ランキングの見方' },
          ]}
        />

        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '16px', lineHeight: 1.4 }}>
          都道府県別<span style={{ color: '#00d4aa' }}>駅乗降者数ランキング</span>の見方
        </h1>

        <p style={{ color: '#e8edf5', fontSize: '16px', lineHeight: 1.8, marginBottom: '12px', fontWeight: 600 }}>
          都道府県別の駅ランキングを「どう比較し、どう読むか」を解説した記事です。
        </p>
        <p style={{ ...pStyle, marginBottom: '12px' }}>
          各都道府県のランキングそのものは
          <Link href="/articles/prefecture-ranking" style={linkStyle}>
            都道府県別駅乗降者数ランキング一覧
          </Link>
          から、ライブデータでの各県ランキング本体は
          <Link href="/station-ranking" style={linkStyle}>全国駅ランキング</Link>
          から確認できます。本記事はランキングそのものではなく、都道府県をまたいで比較するときの注意点と活用方法の解説に特化しています。
        </p>
        <p style={{ ...pStyle, marginBottom: '32px' }}>
          都道府県別のランキングは、同じ指標（乗降者数）でも県ごとに意味が異なります。
          東京都と地方県では都市規模・車社会度・観光需要のバランスが違うため、順位の数字だけを並べても比較になりません。
          比較軸を意識した読み方を身につけると、各県のランキングから得られる情報量が大きく変わります。
        </p>

        {/* 都道府県別ランキングページへの導線 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>都道府県別ランキングページへ</h2>
          <p style={{ ...pStyle, marginBottom: '14px' }}>
            代表的な都道府県のランキング本体ページです。県ごとの特性の違いを、実データで確かめたい場合はこちらから。
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '18px' }}>
            {PREF_LINKS.map((p) => (
              <Link key={p.slug} href={`/station-ranking/${p.slug}`} style={linkChipStyle}>
                {p.name}
                <span style={{ color: '#6b7a99', marginLeft: '6px', fontSize: '11px' }}>
                  {p.note}
                </span>
              </Link>
            ))}
          </div>
          <p style={{ ...pStyle, marginBottom: 0, fontSize: '13px', color: '#6b7a99' }}>
            47都道府県すべての一覧は
            <Link href="/articles/prefecture-ranking" style={linkStyle}>
              都道府県別駅乗降者数ランキング一覧
            </Link>
            から選べます。
          </p>
        </div>

        {/* 参考：例としての上位駅 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>参考：東京都の乗降者数 上位5駅（{year}年）</h2>
          <p style={{ ...pStyle, marginBottom: '16px' }}>
            解説を具体化するため、もっとも利用者数の多い東京都の上位5駅だけ例示します。
            東京都のランキング全体は
            <Link href="/station-ranking/tokyo" style={linkStyle}>
              東京都の駅乗降者数ランキング
            </Link>
            で確認できます。
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #1e2d45' }}>
                  {['順位', '駅名', '市区町村', '乗降者数'].map((h) => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: '#aaa', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {example.map((row, index) => (
                  <tr key={row.station_group_slug} style={{ borderBottom: '1px solid #1e2d45' }}>
                    <td style={{ padding: '10px 16px', color: index < 3 ? '#00d4aa' : '#aaa', fontWeight: index < 3 ? 'bold' : 'normal' }}>
                      {index + 1}位
                    </td>
                    <td style={{ padding: '10px 16px', fontWeight: 'bold' }}>
                      <Link href={`/station/${row.station_group_slug}`} style={{ color: '#e8edf5', textDecoration: 'none' }}>
                        {row.station_name}駅
                      </Link>
                    </td>
                    <td style={{ padding: '10px 16px', color: '#aaa', whiteSpace: 'nowrap' }}>{row.municipality_name}</td>
                    <td style={{ padding: '10px 16px', color: '#00d4aa', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                      {Number(row.passengers).toLocaleString()}人
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ color: '#6b7a99', fontSize: '12px', marginTop: '12px', marginBottom: 0 }}>
            東京都のように複数ターミナルが集中する県では、上位に乗換拠点が並びます。地方県の上位駅とは数字の桁も意味も異なる点に注意してください。
          </p>
        </div>

        {/* 基本的な見方 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>都道府県別ランキングの基本的な見方</h2>
          <p style={pStyle}>
            最初に見るべきは「上位駅集中型か分散型か」です。
            1〜3位に桁違いの数字が並ぶ県は、県庁所在地・政令市ターミナルに人流が集中しています。
            上位から中位までゆるやかに並ぶ県は、複数の中核駅に需要が分散しているか、生活圏の駅が広く利用されている構造です。
          </p>
          <p style={pStyle}>
            次に見るべきは「県庁所在地・政令市の順位」です。
            県庁所在地の駅がそのまま1位に来る県は、交通・商業・行政が一点に集まる単極集中型。
            県庁所在地の駅が2位以下になる県は、別のターミナルが経済・交通のハブになっている「複数核型」です（例：大阪の梅田／難波、神奈川の横浜／武蔵小杉）。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            合わせて
            <Link href="/articles/station-passengers-ranking-japan" style={linkStyle}>
              駅乗降者数ランキングの読み方と活用方法
            </Link>
            で、乗降者数指標そのものの見方を押さえておくと理解しやすくなります。
          </p>
        </div>

        {/* 比較軸 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>都道府県をまたいで比較するときの軸</h2>

          <h3 style={h3Style}>1. 都市規模</h3>
          <p style={pStyle}>
            都道府県の人口規模そのものが、ランキング全体の数字レンジを決めます。
            東京都のトップは数十万人規模、地方県のトップは数万〜十数万人規模になるのが一般的で、絶対値で横断比較する意味は小さい。
            比較するなら「県内1位と県内10位の比率」「1位が県全体の乗降者数に占める割合」といった県内相対指標が有効です。
          </p>

          <h3 style={h3Style}>2. 車社会度</h3>
          <p style={pStyle}>
            地方県では自動車移動が主で、鉄道が補助的な地域が多くあります。
            この場合、ランキング上位の駅=「その県で最も人が集まる拠点」とは限らず、あくまで「鉄道で移動する人の拠点」に過ぎません。
            北海道や沖縄県のように鉄道網が希薄な県では、乗降者数の高低が県の経済・人流を表す代表指標にはならない点を押さえておくと誤読を防げます。
          </p>

          <h3 style={h3Style}>3. 観光需要</h3>
          <p style={pStyle}>
            京都府・沖縄県のような観光需要の強い県では、観光地最寄り駅の数字が季節変動を伴って大きく出やすくなります。
            「常時その駅に人がいる」ではなく「特定期間に集中する」需要を含むため、居住や出店検討で使うときは年間平均と繁忙期で意味が変わる点に注意します。
          </p>

          <h3 style={h3Style}>4. 通勤流入・通学流入</h3>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            神奈川県・埼玉県・千葉県のように、東京都への通勤流入が大きい県は、県内で完結しないランキング構造になります。
            ターミナル駅（横浜・大宮・船橋など）の数字には「県内利用＋東京都への通勤乗換」が混ざっており、純粋な県内需要とは別の視点で読む必要があります。
          </p>
        </div>

        {/* 注意点 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>都道府県別ランキングを読むときの注意点</h2>

          <h3 style={h3Style}>1. 東京都と地方を同じ物差しで比較しない</h3>
          <p style={pStyle}>
            ランキングの順位を県横断で単純比較すると、常に東京都の圧勝になります。
            これは「東京都が優れている」ではなく、都市規模・路線網・集中度が違うだけ。
            県ごとに「その県の中で何が上位に来ているか」を読む相対評価にシフトすると、県別ランキングから得られる情報量が増えます。
          </p>

          <h3 style={h3Style}>2. 乗換駅は数字が大きく出やすい</h3>
          <p style={pStyle}>
            複数事業者・複数路線が乗り入れる駅は、事業者ごとの乗降者数が合算されるため数字が大きくなります。
            地方県でも新幹線停車駅や複数路線の結節点は、純粋な「その街に降りた人数」以上の数値が出ます。
            ランキング上位を見るときは「乗換駅かどうか」を併せて確認することが重要です。
          </p>

          <h3 style={h3Style}>3. 県内人口・交通モードの違いを踏まえる</h3>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            県内人口が少ない県では、そもそも鉄道需要の総量が小さく、ランキング上位駅の数字も限定的になります。
            同時に、車社会度が高い県では「駅利用が少ない=需要が少ない」ではなく「移動手段が鉄道ではない」ことを意味します。
            ランキングを見る前に、その県の人口規模と交通モード（鉄道依存度）を一度押さえておくと誤読が減ります。
          </p>
        </div>

        {/* 活用方法 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>都道府県別ランキングの活用方法</h2>

          <h3 style={h3Style}>居住検討に使う</h3>
          <p style={pStyle}>
            引越し先を県をまたいで検討する場合、ランキングの数字を直接比較するのではなく「県内でどの位置にある駅か」を見ます。
            県内1位のターミナル駅は利便性が高い反面、賃料・混雑が強く、生活満足度は中位駅の方が高いケースも多い。
            <Link href="/articles/is-busy-station-livable" style={linkStyle}>
              駅の乗降者数が多い街は住みやすいのか？
            </Link>
            では住宅駅とターミナル駅の違いを整理しています。
          </p>

          <h3 style={h3Style}>出店検討に使う</h3>
          <p style={pStyle}>
            出店エリアの比較は、県単位ではなく商圏単位で行うのが基本です。
            都道府県別ランキングは「県内でどのエリアに人流拠点があるか」を把握する出発点として使い、
            そこから市区町村・路線単位に解像度を下げていくと判断が安定します。
            路線単位の見方は
            <Link href="/articles/how-to-read-line-passenger-ranking" style={linkStyle}>
              路線別駅乗降者数ランキングの見方
            </Link>
            を参照してください。
          </p>

          <h3 style={h3Style}>不動産・投資の検討に使う</h3>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            不動産・投資の文脈では、県内順位の「変化」を見るのが有効です。
            順位が上がった駅は再開発・人口流入などの成長要因が動いている可能性があり、
            下がった駅は商業・通勤需要の縮小が起きている可能性があります。
            各駅の時系列は
            <Link href="/station-ranking" style={linkStyle}>全国駅ランキング</Link>
            の各駅ページから個別に確認できます。
          </p>
        </div>

        {/* 関連ページへの導線 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>関連ページ・代表県ランキング</h2>
          <p style={{ ...pStyle, marginBottom: '16px' }}>
            代表的な県のランキング本体と、関連する解説記事です。
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '18px' }}>
            {PREF_LINKS.map((p) => (
              <Link key={`bottom-live-${p.slug}`} href={`/station-ranking/${p.slug}`} style={linkChipStyle}>
                {p.name}
              </Link>
            ))}
          </div>
          <ul style={{ ...pStyle, marginBottom: 0, paddingLeft: '20px', listStyle: 'disc' }}>
            <li style={{ marginBottom: '6px' }}>
              <Link href="/articles/tokyo-station-ranking-2023" style={linkStyle}>
                東京都の駅乗降者数ランキング記事（2023年版）
              </Link>
              ： 単極ターミナル集中型の典型
            </li>
            <li style={{ marginBottom: '6px' }}>
              <Link href="/articles/osaka-station-ranking-2023" style={linkStyle}>
                大阪府の駅乗降者数ランキング記事（2023年版）
              </Link>
              ： 複数核型の典型
            </li>
            <li style={{ marginBottom: '6px' }}>
              <Link href="/articles/kanagawa-station-ranking-2023" style={linkStyle}>
                神奈川県の駅乗降者数ランキング記事（2023年版）
              </Link>
              ： 通勤流入型の典型
            </li>
            <li style={{ marginBottom: '6px' }}>
              <Link href="/articles/prefecture-ranking" style={linkStyle}>
                都道府県別駅乗降者数ランキング一覧
              </Link>
              ： 47都道府県すべての入口
            </li>
            <li style={{ marginBottom: '6px' }}>
              <Link href="/articles/station-passengers-ranking-japan" style={linkStyle}>
                駅乗降者数ランキングの読み方と活用方法
              </Link>
              ： 指標そのものの見方
            </li>
            <li>
              <Link href="/articles/how-to-read-line-passenger-ranking" style={linkStyle}>
                路線別駅乗降者数ランキングの見方
              </Link>
              ： 路線軸で読む場合の解説
            </li>
          </ul>
        </div>

        {/* まとめ */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>まとめ</h2>
          <p style={pStyle}>
            都道府県別ランキングは、県ごとの「人流拠点の構造」を掴むためのツールです。
            県をまたいで数字を並べるのではなく、県内での相対順位と、都市規模・車社会度・観光需要・通勤流入という比較軸を踏まえて読むことで、
            各県の特性が浮かび上がります。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            気になる県があれば
            <Link href="/articles/prefecture-ranking" style={linkStyle}>
              都道府県別ランキング一覧
            </Link>
            から該当県に進み、実データで確かめてみてください。
          </p>
        </div>

        {/* 関連データ導線 */}
        <div style={{ ...sectionStyle, textAlign: 'center' as const }}>
          <h2 style={{ ...h2Style, marginBottom: '12px' }}>関連データを見る</h2>
          <p style={{ color: '#6b7a99', fontSize: '13px', marginBottom: '16px' }}>
            気になる県・駅があれば、詳細データを確認してみてください。
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/articles/prefecture-ranking" style={linkButtonStyle}>
              都道府県別ランキング一覧
            </Link>
            <Link href="/station-ranking" style={linkButtonStyle}>
              全国駅ランキング
            </Link>
            <Link href="/articles/station-passengers-ranking-japan" style={linkButtonStyle}>
              駅ランキングの見方
            </Link>
            <Link href="/articles/how-to-read-line-passenger-ranking" style={linkButtonStyle}>
              路線別ランキングの見方
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
