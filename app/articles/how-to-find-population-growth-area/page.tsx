import Link from 'next/link';

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

export default function HowToFindPopulationGrowthAreaPage() {
  return (
    <main style={{ background: '#0a0e1a', minHeight: '100vh', color: '#e8edf5', fontFamily: 'sans-serif' }}>
      <article style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 20px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '16px', lineHeight: 1.4 }}>
          人口が増えている街の見つけ方｜<br />エリア選びの<span style={{ color: '#00d4aa' }}>基本とデータの見方</span>
        </h1>
        <p style={{ ...pStyle, marginBottom: '32px' }}>
          引越し先の検討、店舗の出店候補、不動産投資のエリア選定。いずれの場面でも「そのエリアに人が増えているかどうか」は最も基本的な判断材料です。本記事では、公開データをもとに人口増加エリアを見つける具体的な方法を解説します。
        </p>

        {/* セクション1 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>人口増加エリアはこう見つける</h2>
          <p style={pStyle}>
            エリア分析で見るべき指標は「人口増加率」と「駅の乗降者数推移」の2つです。人口が増えていても駅利用者が伸びていなければ、車依存型のエリアかもしれません。逆に駅利用者が増加傾向でも人口が減少中なら、通過需要が中心の可能性があります。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            この2つの指標がどちらも増加傾向にあるエリアが、生活利便性と将来性の両面で有望な候補です。
          </p>
        </div>

        {/* セクション2 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>具体的なエリア例</h2>

          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#e8edf5', marginBottom: '8px' }}>
              <Link href="/city/kanagawa/kawasakishi" style={linkStyle}>川崎市（神奈川県）</Link>
            </h3>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              東京と横浜に挟まれた立地で、武蔵小杉駅周辺を中心にタワーマンション開発が進行。2010年代以降、人口増加率は全国の政令指定都市でもトップクラスを維持しています。
            </p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#e8edf5', marginBottom: '8px' }}>
              <Link href="/city/chiba/nagareyamashi" style={linkStyle}>流山市（千葉県）</Link>
            </h3>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              つくばエクスプレス開業後に人口が急増。「母になるなら、流山市。」のプロモーション戦略が話題となり、子育て世帯の転入が顕著です。駅周辺の商業施設整備も進んでいます。
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#e8edf5', marginBottom: '8px' }}>
              <Link href="/city/ibaraki/moriyashi" style={linkStyle}>守谷市（茨城県）</Link>
            </h3>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              つくばエクスプレスの快速停車駅があり、秋葉原まで最速32分。都心へのアクセスと住宅価格のバランスが良く、若年層の転入が続いています。
            </p>
          </div>
        </div>

        {/* セクション3 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>人口推移データの見方</h2>
          <p style={pStyle}>
            人口データを見る際は、直近1〜2年の変化だけでなく10年スパンのトレンドを確認することが重要です。短期の増減は再開発やマンション竣工などの一時的要因で動くことがありますが、10年の推移を見れば構造的な変化が分かります。
          </p>
          <p style={pStyle}>
            また、総人口だけでなく生産年齢人口（15〜64歳）の推移にも注目してください。総人口が横ばいでも生産年齢人口が減少しているエリアは、経済活力の低下が懸念されます。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            増加しているエリアであっても、増加ペースが鈍化しているのか加速しているのかで将来の見通しは大きく変わります。
          </p>
        </div>

        {/* セクション4 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>乗降者数との組み合わせ方</h2>
          <p style={pStyle}>
            人口データと駅の乗降者数を組み合わせることで、エリアの実態がより正確に見えてきます。人口が増えていても最寄り駅の乗降者数が横ばいであれば、車移動が中心のエリアである可能性があります。
          </p>
          <p style={pStyle}>
            逆に、乗降者数が増加傾向にある駅は周辺エリアの活性化サインです。商業施設の進出や新路線の開業など、エリア価値の向上が期待できます。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            全国の駅を乗降者数で比較するには<Link href="/station-ranking" style={linkStyle}>駅乗降者数ランキング</Link>が便利です。
          </p>
        </div>

        {/* セクション5 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>AreaScopeでの調べ方</h2>
          <p style={pStyle}>
            <Link href="/city" style={linkStyle}>市区町村一覧</Link>から対象の市区町村を選択すると、1995年〜2020年の人口推移グラフを確認できます。増減率やピーク年も一目で分かります。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            駅の乗降者数は<Link href="/station/list" style={linkStyle}>駅一覧</Link>から個別の駅ページへアクセスすることで、2011年〜2021年の時系列データを確認できます。気になるエリアの駅を複数チェックして、沿線全体のトレンドを把握するのがおすすめです。
          </p>
        </div>

        {/* まとめ・CTA */}
        <div style={{ ...sectionStyle, textAlign: 'center' as const }}>
          <h2 style={{ ...h2Style, marginBottom: '12px' }}>まとめ</h2>
          <p style={{ ...pStyle, textAlign: 'left' as const }}>
            人口増加エリアを見つけるには、人口推移と乗降者数の2つを組み合わせて確認するのが基本です。10年スパンで構造的に人が増えているか、駅の利用者が伸びているかをチェックすれば、エリアの将来性をデータで判断できます。
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '20px' }}>
            <Link href="/city" style={{ display: 'inline-block', color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
              市区町村の人口推移を調べる
            </Link>
            <Link href="/station-ranking" style={{ display: 'inline-block', color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
              駅の乗降者数ランキングを見る
            </Link>
            <Link href="/station/list" style={{ display: 'inline-block', color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
              全国の駅一覧を見る
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}
