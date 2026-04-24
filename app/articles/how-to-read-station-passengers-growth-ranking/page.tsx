import { Metadata } from 'next';
import { neon } from '@neondatabase/serverless';
import Link from 'next/link';
import Breadcrumb from '@/components/Breadcrumb';

const sql = neon(process.env.DATABASE_URL!);

const metaTitle = '乗降者数が増えている駅ランキングの見方｜絶対値と増加率の使い分け';
const metaDescription =
  '乗降者数が増えている駅ランキングをどう読むかを解説。絶対値の増加と増加率の違い、再開発・人口流入・コロナ後の回復など背景の見分け方、ランキングを見るときの注意点をまとめています。';
const canonicalUrl = 'https://areascope.jp/articles/how-to-read-station-passengers-growth-ranking';

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

export default async function HowToReadStationPassengersGrowthRankingPage() {
  // 参考例：2022→2023 の絶対値増加 TOP5（既存の本体記事と同じクエリパターン）
  const example = (await sql`
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
    LIMIT 5
  `) as ExampleRow[];

  return (
    <main style={{ background: '#0a0e1a', minHeight: '100vh', color: '#e8edf5', fontFamily: 'sans-serif' }}>
      <article style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 20px' }}>
        <Breadcrumb
          items={[
            { label: 'TOP', href: '/' },
            { label: '記事一覧', href: '/articles' },
            { label: '乗降者数が増えている駅ランキングの見方' },
          ]}
        />

        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '16px', lineHeight: 1.4 }}>
          乗降者数が<span style={{ color: '#00d4aa' }}>増えている駅ランキング</span>の見方
        </h1>

        <p style={{ color: '#e8edf5', fontSize: '16px', lineHeight: 1.8, marginBottom: '12px', fontWeight: 600 }}>
          駅の乗降者数が増えているランキングを「どう読み、どう解釈するか」を解説した記事です。
        </p>
        <p style={{ ...pStyle, marginBottom: '12px' }}>
          ランキング本体は
          <Link href="/articles/station-passengers-growth-2023" style={linkStyle}>
            乗降者数が最も増えた駅ランキング
          </Link>
          で掲載しています。本記事はランキングそのものではなく、増加ランキングならではの注意点と解釈方法に特化しています。
        </p>
        <p style={{ ...pStyle, marginBottom: '32px' }}>
          増加ランキングは単純な乗降者数ランキングとは違い、「絶対値の増加」と「増加率」で順位が入れ替わります。
          また、増加の背景には再開発・人口流入・乗換導線の変化・観光回復・コロナ後の反動など、性格の異なる複数の要因が混ざっています。
          順位の数字だけを見ても意味を誤読しやすいため、背景と時系列を合わせて読む視点が重要です。
        </p>

        {/* 増加ランキング本体への導線 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>増加ランキング本体ページへ</h2>
          <p style={{ ...pStyle, marginBottom: '16px' }}>
            実際のランキングデータはこちらから。TOP20までの駅名・増加数・前年比較を確認できます。
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link href="/articles/station-passengers-growth-2023" style={linkButtonStyle}>
              乗降者数が増えた駅ランキング（本体）
            </Link>
            <Link href="/station-ranking" style={linkButtonStyle}>
              全国駅ランキング
            </Link>
          </div>
        </div>

        {/* 参考：例としての上位駅 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>参考：乗降者数の増加数 上位5駅（2022→2023年）</h2>
          <p style={{ ...pStyle, marginBottom: '16px' }}>
            解説を具体化するため、絶対値での増加数が大きかった上位5駅を例示します。
            TOP20までの一覧は
            <Link href="/articles/station-passengers-growth-2023" style={linkStyle}>
              乗降者数が最も増えた駅ランキング
            </Link>
            で確認できます。
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #1e2d45' }}>
                  {['順位', '駅名', '都道府県', '2022年', '2023年', '増加数'].map((h) => (
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
          <p style={{ color: '#6b7a99', fontSize: '12px', marginTop: '12px', marginBottom: 0 }}>
            上位は大規模ターミナル駅に集中する傾向があります。後述の「絶対値と増加率の使い分け」と合わせて読んでください。
          </p>
        </div>

        {/* 基本的な見方 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>増加ランキングの基本的な見方</h2>

          <h3 style={h3Style}>絶対値の増加と増加率は別の指標</h3>
          <p style={pStyle}>
            増加ランキングには大きく2通りの並び方があります。絶対値（増加数）で並べると、もともと利用者数の多い大規模ターミナル駅が上位に並びます。
            一方、増加率（前年比）で並べると、母数が小さい郊外駅や新設駅が上位に来やすくなります。
            上位のメンバーは指標の選び方でまったく変わるため、「どちらの指標でのランキングか」を必ず確認してから読む必要があります。
          </p>

          <h3 style={h3Style}>母数が小さい駅は増加率が大きく見えやすい</h3>
          <p style={pStyle}>
            乗降者数が数千人規模の駅が数百人増えるだけでも、増加率では数%〜十数%に達します。
            これは「伸びが著しい」というより「母数が小さいために変化が大きく見える」現象です。
            増加率ランキングの上位には、母数が極端に小さい駅が混ざっていないか、駅規模と合わせて確認する視点が重要になります。
          </p>

          <h3 style={h3Style}>指標を使い分ける</h3>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            大規模ターミナルの動向を見るなら絶対値、成長エリアの発掘なら増加率、というように目的で指標を使い分けると判断がぶれにくくなります。
            乗降者数指標そのものの見方は
            <Link href="/articles/station-passengers-ranking-japan" style={linkStyle}>
              駅乗降者数ランキングの読み方と活用方法
            </Link>
            でまとめています。
          </p>
        </div>

        {/* 増加の背景の見分け方 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>増加の背景を見分ける</h2>
          <p style={{ ...pStyle, marginBottom: '16px' }}>
            乗降者数が増えた背景にはいくつかの典型パターンがあります。順位だけでなく「なぜ増えたか」を見極めると、そのエリアの性格が掴めます。
          </p>

          <h3 style={h3Style}>1. 再開発</h3>
          <p style={pStyle}>
            駅直結の大規模再開発が完了した駅は、オフィス・商業・住宅が一気に増えるため、乗降者数が数年単位で階段状に伸びます。
            完成年をピークに瞬間的な伸びが出たあと、しばらく高止まりするのが特徴です。
          </p>

          <h3 style={h3Style}>2. 人口流入</h3>
          <p style={pStyle}>
            タワーマンション建設や大型住宅開発で住民数が増えた駅は、定期利用が増えるため乗降者数がゆるやかに伸び続けます。
            再開発ほど急激ではなく、数年にわたって連続的に増えるのが特徴です。
          </p>

          <h3 style={h3Style}>3. 乗換導線の変化</h3>
          <p style={pStyle}>
            新路線の開通・既存路線のダイヤ改正・駅改良などで乗換導線が変わると、それまで通過していた人が降りる／他路線へ乗り換えるようになり、乗降者数が不連続に伸びます。
            純粋なエリア需要の増加ではなく、「人流の経路が変わっただけ」のケースを含むため、読み解きに注意が必要です。
          </p>

          <h3 style={h3Style}>4. 観光回復</h3>
          <p style={pStyle}>
            インバウンド再開・大型イベント開催などで観光需要が戻った駅は、短期的に大きな伸びが出ます。
            翌年以降も伸びが続くとは限らず、定常的な需要なのか一時的なイベントなのかを区別して読む必要があります。
          </p>

          <h3 style={h3Style}>5. コロナ後の反動回復</h3>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            2020〜2021年の落ち込みから戻る形での増加は、構造的な成長ではなく「元の水準への復元」である可能性が高い現象です。
            コロナ前（2019年）と比較して本当に超えているのか、あるいはまだ回復途上なのかを確認すると、ランキング上位の意味が正確に判断できます。
            回復動向は
            <Link href="/articles/station-passenger-recovery-analysis" style={linkStyle}>
              駅乗降者数の回復率ランキング
            </Link>
            もあわせて参照できます。
          </p>
        </div>

        {/* 注意点 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>増加ランキングを読むときの注意点</h2>

          <h3 style={h3Style}>1. 一時的な回復と構造的な成長を分ける</h3>
          <p style={pStyle}>
            増加ランキング上位の駅は、コロナ前水準への戻りが主要因のケースが多く含まれます。
            「一時的な反動」と「構造的な成長」を分けて読むには、2019年（コロナ前）との比較を合わせて見るのが基本です。
            2019年比でまだ回復途上なら反動の範囲、2019年を明確に上回っているなら構造的成長の可能性が高くなります。
          </p>

          <h3 style={h3Style}>2. 1年だけの変化では判断しない</h3>
          <p style={pStyle}>
            1年分の増減はダイヤ改正・気象・単発イベントなど短期要因で振れやすく、それ単体でエリアの成長を評価するのは危険です。
            少なくとも3年程度の時系列を見て、「毎年継続して伸びているか」「特定年だけの跳ね上がりか」を区別することが重要です。
          </p>

          <h3 style={h3Style}>3. ターミナル駅の数字は強く出やすい</h3>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            大規模ターミナルは母数が大きいため、同じ成長率でも増加数が巨大な値になります。
            絶対値ランキングではターミナルばかり上位を占めるのが通常で、「ターミナル=エリア成長の代表」とは限りません。
            郊外の住宅駅・再開発駅の本当の勢いを見るには、増加率や県内順位の動きを合わせて確認すると見落としが減ります。
          </p>
        </div>

        {/* 活用方法 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>増加ランキングの活用方法</h2>

          <h3 style={h3Style}>居住検討に使う</h3>
          <p style={pStyle}>
            居住先の検討で増加ランキングを使う場合は、「絶対値の増加」よりも「増加率と背景」を重視します。
            再開発・人口流入による増加は将来の利便性向上につながる可能性がある一方、観光・ダイヤ改正による増加は生活利便性には直結しません。
            住みやすさの観点では
            <Link href="/articles/is-busy-station-livable" style={linkStyle}>
              駅の乗降者数が多い街は住みやすいのか？
            </Link>
            と合わせて読むと、ターミナル化と住みやすさの違いが整理できます。
          </p>

          <h3 style={h3Style}>出店検討に使う</h3>
          <p style={pStyle}>
            出店検討では、増加している駅の「増加している時間帯・曜日・利用者層」を推定するのが有効です。
            通勤需要が増えている駅なら平日朝夕型の業態、観光回復型の駅なら休日型の業態が相性よく、単純に「伸びている駅=出店適地」と結びつけるのはリスクが残ります。
            路線単位・市区町村単位の解像度は
            <Link href="/articles/how-to-read-line-passenger-ranking" style={linkStyle}>
              路線別駅乗降者数ランキングの見方
            </Link>
            や
            <Link href="/articles/how-to-read-prefecture-station-ranking" style={linkStyle}>
              都道府県別駅乗降者数ランキングの見方
            </Link>
            で補完できます。
          </p>

          <h3 style={h3Style}>不動産・投資の検討に使う</h3>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            不動産・投資文脈では、増加ランキングは「今の順位」ではなく「増加が続いているか」を見ます。
            複数年連続で順位を上げている駅は構造的成長の可能性があり、1年だけ急伸した駅は一時要因の可能性が高い。
            各駅の時系列は
            <Link href="/station-ranking" style={linkStyle}>全国駅ランキング</Link>
            の各駅ページから個別に確認できます。
          </p>
        </div>

        {/* 関連ページ導線 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>関連ページ・関連解説</h2>
          <ul style={{ ...pStyle, marginBottom: 0, paddingLeft: '20px', listStyle: 'disc' }}>
            <li style={{ marginBottom: '6px' }}>
              <Link href="/articles/station-passengers-growth-2023" style={linkStyle}>
                乗降者数が最も増えた駅ランキング（本体）
              </Link>
              ： 実データでのTOP20
            </li>
            <li style={{ marginBottom: '6px' }}>
              <Link href="/articles/station-passenger-recovery-analysis" style={linkStyle}>
                駅乗降者数の回復率ランキング
              </Link>
              ： コロナ前比の回復度合い
            </li>
            <li style={{ marginBottom: '6px' }}>
              <Link href="/articles/station-passengers-ranking-japan" style={linkStyle}>
                駅乗降者数ランキングの読み方と活用方法
              </Link>
              ： 指標そのものの見方
            </li>
            <li style={{ marginBottom: '6px' }}>
              <Link href="/articles/how-to-read-line-passenger-ranking" style={linkStyle}>
                路線別駅乗降者数ランキングの見方
              </Link>
              ： 路線軸で読む場合の解説
            </li>
            <li style={{ marginBottom: '6px' }}>
              <Link href="/articles/how-to-read-prefecture-station-ranking" style={linkStyle}>
                都道府県別駅乗降者数ランキングの見方
              </Link>
              ： 県横断の比較軸
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
            増加ランキングは「伸びている駅を見つける」ツールですが、絶対値か増加率か、背景が何か、1年だけの変化か連続した変化か、といった視点で読み方が大きく変わります。
            順位の数字だけで判断せず、指標の選び方・背景・時系列を合わせて読むと、伸びている駅の本当の性格が見えてきます。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            実データは
            <Link href="/articles/station-passengers-growth-2023" style={linkStyle}>
              乗降者数が最も増えた駅ランキング
            </Link>
            から確認できます。気になる駅は時系列も合わせてチェックしてみてください。
          </p>
        </div>

        {/* 関連データ導線 */}
        <div style={{ ...sectionStyle, textAlign: 'center' as const }}>
          <h2 style={{ ...h2Style, marginBottom: '12px' }}>関連データを見る</h2>
          <p style={{ color: '#6b7a99', fontSize: '13px', marginBottom: '16px' }}>
            気になる駅やエリアがあれば、詳細データを確認してみてください。
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/articles/station-passengers-growth-2023" style={linkButtonStyle}>
              増加ランキング本体
            </Link>
            <Link href="/station-ranking" style={linkButtonStyle}>
              全国駅ランキング
            </Link>
            <Link href="/articles/station-passengers-ranking-japan" style={linkButtonStyle}>
              駅ランキングの見方
            </Link>
            <Link href="/articles/how-to-read-line-passenger-ranking" style={linkButtonStyle}>
              路線別の見方
            </Link>
            <Link href="/articles/how-to-read-prefecture-station-ranking" style={linkButtonStyle}>
              都道府県別の見方
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
