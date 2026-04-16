import Link from 'next/link';
import type { Metadata } from 'next';
import Breadcrumb from '@/components/Breadcrumb';

export const metadata: Metadata = {
  title: '駅の乗降者数から見る街の特徴｜AreaScope',
  description: '駅の乗降者数データを使ったエリア分析の基本と具体例を交えた読み方を紹介します。',
  alternates: {
    canonical: 'https://areascope.jp/articles/station-passengers-area-analysis',
  },
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

export default function StationPassengersAreaAnalysisPage() {
  return (
    <main style={{ background: '#0a0e1a', minHeight: '100vh', color: '#e8edf5', fontFamily: 'sans-serif' }}>
      <article style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 20px' }}>
        <Breadcrumb items={[
          { label: 'TOP', href: '/' },
          { label: '記事一覧', href: '/articles' },
          { label: '駅の乗降者数から見る街の特徴' },
        ]} />
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '16px', lineHeight: 1.4 }}>
          駅の乗降者数から見る街の特徴｜<br />エリア分析の<span style={{ color: '#00d4aa' }}>基本と見方</span>
        </h1>
        <p style={{ ...pStyle, marginBottom: '32px' }}>
          駅の乗降者数は、そのエリアにどれだけの「人の流れ」があるかを示す指標です。引越し先の生活利便性、店舗出店の集客見込み、投資判断の参考など、エリアを評価するさまざまな場面で活用できます。
        </p>

        {/* セクション1：結論 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>乗降者数で何が分かるか</h2>
          <p style={pStyle}>
            乗降者数が増加傾向にある駅は、その周辺エリアの活性化サインになりうるデータです。再開発、新路線の開業、住宅供給の増加など、何らかの要因でエリアへの需要が高まっていることを示唆します。
          </p>
          <p style={pStyle}>
            ただし重要なのは、絶対値の大小ではなく「推移」を見ることです。現時点で利用者が多い駅が必ずしも今後も伸びるとは限りません。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            乗降者数の推移に加えて人口データを組み合わせると、エリアの実態をより立体的に把握できます。
          </p>
        </div>

        {/* セクション2：具体例 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>具体例で見る乗降者数の差</h2>

          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#e8edf5', marginBottom: '8px' }}>
              <Link href="/station/shinjuku-tokyo-shinjukuku" style={linkStyle}>新宿駅（東京都）</Link>
              ── 1日100万人超のターミナル
            </h3>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              JR・私鉄・地下鉄が集中する世界最大級のターミナル駅です。乗り換え需要が非常に大きく、周辺には商業・オフィスが高密度に集積しています。乗降者数の絶対値としては国内最大ですが、居住エリアとしての評価はまた別の視点が必要です。
            </p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#e8edf5', marginBottom: '8px' }}>
              <Link href="/station/kanazawa-ishikawa-kanazawashi" style={linkStyle}>金沢駅（石川県）</Link>
              ── 新幹線開業で変化した地方駅
            </h3>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              2015年の北陸新幹線開業後、乗降者数が大幅に増加しました。観光客の増加に加えて、ビジネス需要の拡大もあり、エリア全体の経済活性化につながった好例です。乗降者数の「推移」がエリア変化を如実に映し出しています。
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#e8edf5', marginBottom: '8px' }}>
              <Link href="/station/kouzan-gifu-takayamashi" style={linkStyle}>高山駅（岐阜県）</Link>
              ── 観光需要型の駅
            </h3>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              飛騨高山の観光拠点として外国人旅行者を含む観光需要で利用されている駅です。乗降者数は一定規模ありますが、居住者の日常利用ではなく観光シーズンに偏る傾向があります。乗降者数が多くても、その性質を見極めることが大切です。
            </p>
          </div>
        </div>

        {/* セクション3：見方 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>絶対値と推移、どちらを見るべきか</h2>
          <p style={pStyle}>
            乗降者数の絶対値が大きい駅は商業集積が進んでおり利便性は高い傾向がありますが、住環境としては騒音・混雑・家賃の高さなどの課題を伴うことも少なくありません。「乗降者数が多い＝住みやすい」とは限らない点に注意が必要です。
          </p>
          <p style={pStyle}>
            エリア選びでより参考になるのは、乗降者数の「推移」です。過去10年で右肩上がりの駅は、エリアへの需要が構造的に増加している可能性を示唆しています。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            単年の増減はイベントや災害などの一時要因で動くことがあるため、10年スパンのトレンドで判断するのが基本です。
          </p>
        </div>

        {/* セクション4：人口との組み合わせ */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>人口データとの組み合わせ方</h2>
          <p style={pStyle}>
            乗降者数の推移だけでは、その駅を利用しているのが「住民」なのか「観光客・通過者」なのか判別できません。人口データと組み合わせることで、より正確なエリア評価が可能になります。
          </p>
          <p style={pStyle}>
            乗降者数が増加傾向で、かつ周辺の人口も増えているエリアは、居住需要と交通需要の両方が伸びており、エリアとしての注目度が高い傾向にあります。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            一方、乗降者数は増えているのに人口が減少しているケースでは、観光需要や通過利用が中心の可能性があります。<Link href="/station-ranking" style={linkStyle}>駅乗降者数ランキング</Link>で気になる駅を見つけたら、その市区町村の人口推移もあわせて確認してみてください。
          </p>
        </div>

        {/* セクション5：AreaScopeでの調べ方 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>AreaScopeでの調べ方</h2>
          <p style={pStyle}>
            <Link href="/station/list" style={linkStyle}>駅一覧</Link>から気になる駅を選ぶと、2011年〜2021年の乗降者数推移をグラフで確認できます。コロナ前後の変化や長期的な増減トレンドが一目で分かります。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            エリアの人口動態は<Link href="/city" style={linkStyle}>市区町村一覧</Link>から確認できます。駅の乗降者数と市区町村の人口推移を見比べることで、そのエリアに人が「住んでいるのか」「通過しているのか」の判断材料になります。
          </p>
        </div>

        {/* まとめ・CTA */}
        <div style={{ ...sectionStyle, textAlign: 'center' as const }}>
          <h2 style={{ ...h2Style, marginBottom: '12px' }}>まとめ</h2>
          <p style={{ ...pStyle, textAlign: 'left' as const }}>
            駅の乗降者数は、エリアの需要を測る基本的な指標です。絶対値よりも推移を重視し、人口データと組み合わせることで、エリアの実態と将来性をデータで判断できます。気になるエリアがあれば、まず駅と市区町村のデータを確認するところから始めてみてください。
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '20px' }}>
            <Link href="/station-ranking" style={{ display: 'inline-block', color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
              全国の駅乗降者数ランキングを見る
            </Link>
            <Link href="/station/list" style={{ display: 'inline-block', color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
              気になる駅のデータを調べる
            </Link>
            <Link href="/city" style={{ display: 'inline-block', color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
              市区町村の人口推移を見る
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}
