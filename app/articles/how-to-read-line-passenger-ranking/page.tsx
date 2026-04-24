import { Metadata } from 'next';
import { neon } from '@neondatabase/serverless';
import Link from 'next/link';
import Breadcrumb from '@/components/Breadcrumb';

const sql = neon(process.env.DATABASE_URL!);

const metaTitle = '路線別駅乗降者数ランキングの見方｜通過型路線と生活路線の読み分け';
const metaDescription =
  '路線別の駅乗降者数ランキングをどう読むかを解説。通勤路線・観光路線・生活路線の違い、ターミナル依存の見方、路線ごとの特徴の比較方法をまとめています。';
const canonicalUrl = 'https://areascope.jp/articles/how-to-read-line-passenger-ranking';

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

// 参考表示用の主要路線（/line/[slug]/ranking へ誘導）
const LINE_LINKS: { slug: string; name: string; note: string }[] = [
  { slug: 'yamanote',        name: '山手線',     note: '環状型のターミナル路線' },
  { slug: 'chuo',            name: '中央線',     note: '東西通勤の大動脈' },
  { slug: 'odakyu',          name: '小田急線',   note: '郊外型の通勤路線' },
  { slug: 'toyoko',          name: '東横線',     note: '生活・通勤の両立' },
  { slug: 'keio-inokashira', name: '京王井の頭線', note: '生活路線の典型例' },
  { slug: 'ginza',           name: '銀座線',     note: '都心完結の生活路線' },
];

async function getLatestYear(): Promise<number> {
  const rows = await sql`SELECT MAX(year) AS year FROM station_passengers`;
  return Number(rows[0]?.year) || 2023;
}

export default async function HowToReadLinePassengerRankingPage() {
  const year = await getLatestYear();

  // 参考例：山手線の乗降者数TOP5（ランキング記事ではないため5件で打ち切り）
  const example = (await sql`
    SELECT
      s.station_group_slug,
      MAX(s.station_name) AS station_name,
      CAST(SUM(sp.passengers) AS bigint) AS passengers
    FROM stations s
    INNER JOIN station_passengers sp
      ON s.station_key = sp.station_key
      AND sp.year = ${year}
    WHERE s.station_group_slug IS NOT NULL
      AND s.line_name = '山手線'
      AND s.operator_name = '東日本旅客鉄道'
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
            { label: '路線別駅乗降者数ランキングの見方' },
          ]}
        />

        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '16px', lineHeight: 1.4 }}>
          路線別<span style={{ color: '#00d4aa' }}>駅乗降者数ランキング</span>の見方
        </h1>

        <p style={{ color: '#e8edf5', fontSize: '16px', lineHeight: 1.8, marginBottom: '12px', fontWeight: 600 }}>
          路線別の駅ランキングを「どう読み、どう使い分けるか」を解説した記事です。
        </p>
        <p style={{ ...pStyle, marginBottom: '12px' }}>
          各路線の駅ランキングそのものは
          <Link href="/line" style={linkStyle}>路線一覧</Link>
          から、特定路線の深掘り記事は
          <Link href="/articles/line-passenger-ranking/yamanote" style={linkStyle}>山手線の駅乗降者数ランキング</Link>
          などから確認できます。本記事はランキングそのものではなく、路線ごとにランキングを読むときの注意点と活用方法に特化しています。
        </p>
        <p style={{ ...pStyle, marginBottom: '32px' }}>
          路線ランキングは「全国ランキングを路線で絞り込んだもの」ではありません。
          路線には通勤・観光・生活といった用途の違いがあり、上位駅の意味も路線タイプによって変わります。
          「上位だから重要」ではなく「その路線の中で何が上位か」を読むのがポイントです。
        </p>

        {/* /line/[slug]/ranking への誘導 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>路線別ランキングページへ</h2>
          <p style={{ ...pStyle, marginBottom: '14px' }}>
            各路線の駅ランキングは、以下の路線ページから確認できます。路線タイプの例として代表的なものを並べています。
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
            {LINE_LINKS.map((l) => (
              <Link key={l.slug} href={`/line/${l.slug}/ranking`} style={linkChipStyle}>
                {l.name}
                <span style={{ color: '#6b7a99', marginLeft: '6px', fontSize: '11px' }}>
                  {l.note}
                </span>
              </Link>
            ))}
          </div>
          <p style={{ ...pStyle, marginBottom: 0, fontSize: '13px', color: '#6b7a99' }}>
            他の路線は<Link href="/line" style={linkStyle}>路線一覧</Link>から選べます。
          </p>
        </div>

        {/* 参考：例としての上位5駅 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>参考：山手線の乗降者数 上位5駅（{year}年）</h2>
          <p style={{ ...pStyle, marginBottom: '16px' }}>
            解説を具体化するため、代表的な環状路線として山手線の上位5駅だけ例示します。
            路線全体のランキングは
            <Link href="/articles/line-passenger-ranking/yamanote" style={linkStyle}>
              山手線の駅乗降者数ランキング
            </Link>
            で確認できます。
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #1e2d45' }}>
                  {['順位', '駅名', '乗降者数'].map((h) => (
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
                    <td style={{ padding: '10px 16px', color: '#00d4aa', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                      {Number(row.passengers).toLocaleString()}人
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ color: '#6b7a99', fontSize: '12px', marginTop: '12px', marginBottom: 0 }}>
            山手線のように多数の他路線と接続する環状路線では、上位駅＝ターミナル駅となる傾向が強くなります。
          </p>
        </div>

        {/* 基本的な見方 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>路線ランキングの基本的な見方</h2>
          <p style={pStyle}>
            路線ランキングで最初に見るべきは「上位駅と下位駅の差」です。
            上位に集中している路線は、その路線がターミナル駅への片寄りが強い「通過型」の性格を持ちます。
            一方、上位から下位まで大きな差がなくなだらかに並ぶ路線は、沿線全体で利用が分散している「生活型」の傾向があります。
          </p>
          <p style={pStyle}>
            次に見るべきは「路線の端と中間の数字」です。
            始発・終着駅が上位に来る路線は通勤の流入元／流出先として機能しており、沿線住民の利用が中心。
            逆に中間駅が上位に来る路線は、その路線が他路線との乗換ハブを担っていることが多くなります。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            <Link href="/articles/station-passengers-ranking-japan" style={linkStyle}>
              駅乗降者数ランキングの読み方と活用方法
            </Link>
            では、乗降者数指標そのものの見方を扱っています。路線ランキングを読む前提として合わせて確認すると理解が深まります。
          </p>
        </div>

        {/* 路線タイプ別の特徴 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>路線タイプ別の特徴</h2>

          <h3 style={h3Style}>1. 通勤路線</h3>
          <p style={pStyle}>
            中央線・小田急線・東横線など、郊外と都心を結ぶ路線は通勤路線と呼ばれます。
            朝ラッシュ時の流入方向が一方向に偏り、都心側ターミナル駅の乗降者数が突出するのが特徴です。
            ランキング上位は都心側に集中し、郊外の駅は順位が下がる傾向があります。
            ただし「下位駅＝住みやすくない」ではなく、多くの通勤路線では中〜下位駅こそが住宅需要の中心です。
          </p>

          <h3 style={h3Style}>2. 観光路線</h3>
          <p style={pStyle}>
            浅草線や一部の地方ローカル線など、観光需要が強い路線では、観光地最寄り駅が平日／休日で大きく利用実態が変わります。
            年間の乗降者数ランキングだけでは「日常生活での重要度」を過大評価しやすい点に注意が必要です。
            観光路線の場合は、休日ピークと平日平均を分けて見る意識があるとブレが減ります。
          </p>

          <h3 style={h3Style}>3. 生活路線</h3>
          <p style={pStyle}>
            銀座線・井の頭線など、沿線全域が生活圏で完結している路線は生活路線と呼べます。
            ランキング上位と下位の差が小さく、「上位でなくてもアクセスと生活機能は十分」というケースが多くなります。
            <Link href="/articles/line-passenger-ranking/inokashira" style={linkStyle}>
              京王井の頭線の駅乗降者数ランキング
            </Link>
            は生活路線として読むときの参考になります。
          </p>
        </div>

        {/* 注意点 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>路線ランキングを読むときの注意点</h2>

          <h3 style={h3Style}>1. ターミナル依存に注意する</h3>
          <p style={pStyle}>
            多くの路線で、1〜2駅のターミナル駅が路線全体の乗降者数の大半を占めます。
            たとえば他路線への乗換駅がランキング1位にあると、その数値は「路線単独の利用量」というより「他路線へ流れる通過量」を含んでいます。
            「路線上位＝需要中心」ではなく、「この路線のランキング上位は、どの路線の乗換として使われているか」を意識すると読み違いを防げます。
          </p>

          <h3 style={h3Style}>2. 途中駅の評価を見落とさない</h3>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            ランキングは順位が注目されがちですが、住みやすさや出店検討では中位〜下位の駅こそ重要になります。
            通勤のピーク集中が緩く、賃料・店舗家賃も都心ターミナル比で抑えられることが多いためです。
            路線ランキングは「どの駅が一番多いか」だけでなく、「中位にどんな駅が並ぶか」も合わせて確認すると判断の解像度が上がります。
          </p>
        </div>

        {/* 活用方法 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>路線ランキングの活用方法</h2>

          <h3 style={h3Style}>居住先の検討に使う</h3>
          <p style={pStyle}>
            居住先を検討するときは、路線ランキング「上位」ではなく「中位の駅特性」が参考になります。
            通勤路線の中位駅は、ターミナル直通のアクセスを確保しつつ、混雑・賃料が相対的に抑えられるエリアであることが多いためです。
            <Link href="/articles/is-busy-station-livable" style={linkStyle}>
              駅の乗降者数が多い街は住みやすいのか？
            </Link>
            とあわせて、ターミナル駅と住宅駅の違いを整理すると判断しやすくなります。
          </p>

          <h3 style={h3Style}>出店エリアの検討に使う</h3>
          <p style={pStyle}>
            出店検討では路線内の順位だけでなく、「どういう滞留が起きている駅か」が重要です。
            通勤路線のターミナルは朝夕に強く、生活路線の中位駅は平日昼〜夜の滞留が強い傾向があります。
            単純な乗降者数比較ではなく、路線タイプと駅の役割を踏まえて候補を絞り込むと判断が安定します。
          </p>

          <h3 style={h3Style}>不動産・投資の検討に使う</h3>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            投資判断では「路線内の順位そのもの」より「時系列変化」の方が有効です。
            路線全体が縮小傾向か拡大傾向か、どの駅が順位を上げ下げしているかを見ることで、エリアのポテンシャルをより正確に読み取れます。
            時系列推移は
            <Link href="/station-ranking" style={linkStyle}>全国駅ランキング</Link>
            の各駅ページから個別に確認できます。
          </p>
        </div>

        {/* 路線ページへの導線 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>主な路線ページ・関連記事</h2>
          <p style={{ ...pStyle, marginBottom: '16px' }}>
            路線タイプ別にどう違うかを実データで確かめたい場合は、以下から該当する路線ページへ移動できます。
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '18px' }}>
            {LINE_LINKS.map((l) => (
              <Link key={`bottom-${l.slug}`} href={`/line/${l.slug}/ranking`} style={linkChipStyle}>
                {l.name}
              </Link>
            ))}
          </div>
          <ul style={{ ...pStyle, marginBottom: 0, paddingLeft: '20px', listStyle: 'disc' }}>
            <li style={{ marginBottom: '6px' }}>
              <Link href="/articles/line-passenger-ranking/yamanote" style={linkStyle}>
                山手線の駅乗降者数ランキング（深掘り）
              </Link>
              ： 環状・ターミナル集中型の典型例
            </li>
            <li style={{ marginBottom: '6px' }}>
              <Link href="/articles/line-passenger-ranking/inokashira" style={linkStyle}>
                京王井の頭線の駅乗降者数ランキング（深掘り）
              </Link>
              ： 生活路線の典型例
            </li>
            <li>
              <Link href="/line" style={linkStyle}>
                路線一覧
              </Link>
              ： すべての路線ページへの入口
            </li>
          </ul>
        </div>

        {/* まとめ */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>まとめ</h2>
          <p style={pStyle}>
            路線ランキングは、路線の性格を掴むための分析ツールです。
            ランキング上位を「重要な駅」と単純に読むのではなく、「通勤路線か・観光路線か・生活路線か」を判定してから数字の意味を解釈する必要があります。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            上位駅への集中度、中位駅の性格、ターミナル依存の有無を見ると、同じ「乗降者数ランキング」でも路線ごとに違う読み方ができます。
            気になる路線があれば
            <Link href="/line" style={linkStyle}>路線一覧</Link>
            から該当ページに移動し、実データで確かめてみてください。
          </p>
        </div>

        {/* 関連データ導線 */}
        <div style={{ ...sectionStyle, textAlign: 'center' as const }}>
          <h2 style={{ ...h2Style, marginBottom: '12px' }}>関連データを見る</h2>
          <p style={{ color: '#6b7a99', fontSize: '13px', marginBottom: '16px' }}>
            気になる路線・駅があれば、詳細データを確認してみてください。
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/line" style={linkButtonStyle}>
              路線一覧
            </Link>
            <Link href="/articles/line-passenger-ranking/yamanote" style={linkButtonStyle}>
              山手線ランキング
            </Link>
            <Link href="/articles/line-passenger-ranking/inokashira" style={linkButtonStyle}>
              京王井の頭線ランキング
            </Link>
            <Link href="/articles/station-passengers-ranking-japan" style={linkButtonStyle}>
              駅ランキングの見方
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
