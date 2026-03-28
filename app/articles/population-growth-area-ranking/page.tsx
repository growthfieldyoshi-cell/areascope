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

export default function PopulationGrowthAreaRankingPage() {
  return (
    <main style={{ background: '#0a0e1a', minHeight: '100vh', color: '#e8edf5', fontFamily: 'sans-serif' }}>
      <article style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 20px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '16px', lineHeight: 1.4 }}>
          人口増加エリアランキングの見方｜<br />増えている街を<span style={{ color: '#00d4aa' }}>正しく読む</span>
        </h1>

        <p style={{ color: '#e8edf5', fontSize: '16px', lineHeight: 1.8, marginBottom: '12px', fontWeight: 600 }}>
          人口が増えている街＝良い街、とは限りません。増加の「質」を見分けることが重要です。
        </p>
        <p style={{ ...pStyle, marginBottom: '32px' }}>
          人口増加ランキングの上位に出てくるエリアでも、一時的な再開発によるものと、構造的に人が集まり続けているものでは将来性がまったく異なります。この記事では、増加データを正しく読むためのポイントを解説します。
        </p>

        <div style={sectionStyle}>
          <h2 style={h2Style}>増加率だけで判断すると見誤る</h2>
          <p style={pStyle}>
            人口増加ランキングでは「増加率」が指標として使われることが多いですが、これだけで判断するのは危険です。人口1万人の街が500人増えれば増加率5%ですが、人口100万人の街が5,000人増えても増加率は0.5%です。
          </p>
          <p style={pStyle}>
            増加率が高くても、絶対数が小さければ大型マンション1棟の竣工で大きく動きます。逆に、増加率は低くても絶対数で数千〜数万人が増えているエリアは、構造的な需要の裏付けがある傾向があります。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            増加率と絶対数の両方を確認することが、ランキングを正しく読む第一歩です。
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>増加の3パターン</h2>
          <p style={{ ...pStyle, marginBottom: '20px' }}>
            人口増加エリアは、増加の性質によって大きく3つに分類できます。
          </p>

          <div style={{ marginBottom: '16px' }}>
            <p style={{ color: '#e8edf5', fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>① 継続増加型</p>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              10年以上にわたって安定的に人口が増えているエリアです。交通インフラの整備、雇用の集積、子育て環境の充実など、複合的な要因で人が集まり続けている傾向があります。
            </p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <p style={{ color: '#e8edf5', fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>② 再開発一時増加型</p>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              大規模マンションやタワマン建設で短期間に人口が急増するパターンです。竣工後の数年は増加しますが、その後横ばいや減少に転じるケースがあります。増加が「いつから」「どれくらい続いているか」を推移で確認する必要があります。
            </p>
          </div>

          <div>
            <p style={{ color: '#e8edf5', fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>③ 回復型</p>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              過去に人口が減少していたエリアが、再開発や新路線開業をきっかけに増加に転じたケースです。直近の増加率は高く見えますが、過去の減少分を取り戻している段階の可能性もあるため、長期推移で確認する必要があります。
            </p>
          </div>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>NG例：見かけの増加だけで判断するケース</h2>
          <p style={pStyle}>
            ある郊外エリアで人口増加率が3%を超えていたとします。しかし推移を見ると、大型マンションの竣工があった1年だけ急増し、その前後は横ばいだったというケースは珍しくありません。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            この場合、エリア全体の需要が伸びているわけではなく、住戸供給に一時的に反応しただけです。引越し先や投資先として判断するなら、単年の増減ではなく5〜10年の推移を確認することが不可欠です。
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>駅の乗降者数と合わせて判断する</h2>
          <p style={pStyle}>
            人口が増えているエリアの最寄り駅の乗降者数も伸びていれば、交通需要と居住需要が揃っているサインです。生活利便性が高まっている可能性があります。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            逆に、人口は増えているが乗降者数が横ばいのエリアは、車中心の生活圏である可能性があります。<Link href="/station-ranking" style={linkStyle}>駅乗降者数ランキング</Link>で周辺駅の状況を確認し、人口データと合わせて判断してください。
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>AreaScopeでの調べ方</h2>
          <p style={pStyle}>
            <Link href="/city" style={linkStyle}>市区町村一覧</Link>から対象エリアを選ぶと、1995年〜2020年の人口推移を確認できます。増加が継続的か一時的かを推移グラフで判断できます。
          </p>
          <p style={pStyle}>
            <Link href="/station/list" style={linkStyle}>駅一覧</Link>から最寄り駅の乗降者数推移を確認し、人口データと見比べることで増加の質を見極められます。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            <Link href="/station-ranking" style={linkStyle}>駅乗降者数ランキング</Link>で都道府県別に駅の規模感を比較するのもおすすめです。
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>まとめ</h2>
          <p style={pStyle}>
            人口増加ランキングの上位だからといって、無条件に「良い街」とは判断できません。増加率と絶対数、推移の継続性、乗降者数との関係を総合的に見ることで、本当に注目すべきエリアが見えてきます。
          </p>
        </div>

        <div style={{ ...sectionStyle, textAlign: 'center' as const }}>
          <h2 style={{ ...h2Style, marginBottom: '12px' }}>データでエリアを確認してみる</h2>
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
