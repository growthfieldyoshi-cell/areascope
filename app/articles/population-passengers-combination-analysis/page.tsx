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

export default function PopulationPassengersCombinationAnalysisPage() {
  return (
    <main style={{ background: '#0a0e1a', minHeight: '100vh', color: '#e8edf5', fontFamily: 'sans-serif' }}>
      <article style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 20px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '16px', lineHeight: 1.4 }}>
          人口と乗降者数を組み合わせて見るエリア分析｜<br />本当に見るべき<span style={{ color: '#00d4aa' }}>指標とは</span>
        </h1>
        <p style={pStyle}>
          エリア分析をする際、人口や駅の乗降者数といった単一の指標だけで判断してしまうと、実態を見誤ることがあります。
        </p>
        <p style={{ ...pStyle, marginBottom: '32px' }}>
          重要なのは、それぞれのデータを組み合わせて「街の性質」を読み解くことです。
        </p>

        <div style={sectionStyle}>
          <h2 style={h2Style}>なぜ単一指標では判断できないのか</h2>
          <p style={pStyle}>
            人口が多いエリアが必ずしも便利とは限りません。人口規模が大きくても、鉄道網が発達していなければ車移動が前提の生活圏である可能性があります。
          </p>
          <p style={pStyle}>
            一方、乗降者数が多い駅の周辺が住みやすいとも言い切れません。ターミナル駅は乗り換え・通過利用が大半を占め、住環境としては混雑や騒音の影響を受けやすい傾向があります。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            人口と乗降者数はそれぞれ異なる側面を示す指標です。単体で見るのではなく、2つの「関係性」から街の性質を読むことがエリア分析の基本になります。
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>人口と乗降者数の4パターン</h2>
          <p style={{ ...pStyle, marginBottom: '20px' }}>
            人口の増減と乗降者数の増減を掛け合わせると、エリアの特徴を4つのパターンに整理できます。
          </p>

          <div style={{ marginBottom: '16px' }}>
            <p style={{ color: '#e8edf5', fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>人口↑ × 乗降者数↑</p>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              生活需要と交通利便性がともに伸びている状態です。住宅供給が増え、商業施設の集積も進んでいる発展エリアの傾向があります。
            </p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <p style={{ color: '#e8edf5', fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>人口↑ × 乗降者数→</p>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              住宅地として人気がある一方、駅利用は伸びていないパターンです。車中心のベッドタウンや、郊外の大規模住宅開発エリアに見られる傾向があります。
            </p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <p style={{ color: '#e8edf5', fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>人口↓ × 乗降者数↑</p>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              居住者は減っているが駅利用は増えているケースです。観光需要や通過利用が中心の可能性があり、生活需要とは性質が異なります。
            </p>
          </div>

          <div>
            <p style={{ color: '#e8edf5', fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>人口↓ × 乗降者数↓</p>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              エリア全体の需要が縮小傾向にある可能性があります。長期的にインフラや商業施設の維持が難しくなるケースもあるため、注意が必要です。
            </p>
          </div>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>この視点で見えること</h2>
          <p style={pStyle}>
            「便利そう」に見える街でも、乗降者数の内訳が通過型であれば、住む人にとっての利便性は高くないかもしれません。データを組み合わせることで、印象とのギャップを発見できます。
          </p>
          <p style={pStyle}>
            将来的に伸びるエリアを見つけるには、現時点の数値だけでなく「推移の方向」が重要です。人口も乗降者数もまだ小さいが、どちらも右肩上がりのエリアは、今後の発展が期待できる兆しといえます。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            また、投資目的と居住目的では注目すべきパターンが異なります。投資なら「人口↑×乗降者数↑」の発展型、居住なら利便性と住環境のバランスが取れた中規模エリアが選択肢になりやすい傾向があります。
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>AreaScopeでの調べ方</h2>
          <p style={pStyle}>
            <Link href="/city" style={linkStyle}>市区町村一覧</Link>から対象エリアを選ぶと、1995年〜2020年の人口推移を確認できます。増減の傾向やピーク年が一目で分かります。
          </p>
          <p style={pStyle}>
            <Link href="/station/list" style={linkStyle}>駅一覧</Link>から気になる駅を選べば、2011年〜2021年の乗降者数推移を確認できます。人口推移と見比べることで、4パターンのどれに該当するかを判断できます。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            <Link href="/station-ranking" style={linkStyle}>駅乗降者数ランキング</Link>では、都道府県別に駅の利用規模を比較できます。候補エリアの駅がどの程度の規模感なのか把握するのに便利です。
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>まとめ</h2>
          <p style={pStyle}>
            エリア分析では、単一の指標に頼るのではなく、人口と乗降者数を組み合わせて見ることが重要です。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            AreaScopeを活用することで、街の特徴や将来性をより立体的に把握することができます。
          </p>
        </div>

        <div style={{ ...sectionStyle, textAlign: 'center' as const }}>
          <h2 style={{ ...h2Style, marginBottom: '12px' }}>データでエリアを分析してみる</h2>
          <p style={{ color: '#6b7a99', fontSize: '13px', marginBottom: '16px' }}>
            気になるエリアがあれば、まずデータを確認するところから始めてみてください。
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/city" style={{ display: 'inline-block', color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
              市区町村から探す
            </Link>
            <Link href="/station/list" style={{ display: 'inline-block', color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
              駅から探す
            </Link>
            <Link href="/station-ranking" style={{ display: 'inline-block', color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
              ランキングを見る
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
