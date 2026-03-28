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

export default function RuralCityLivabilityPage() {
  return (
    <main style={{ background: '#0a0e1a', minHeight: '100vh', color: '#e8edf5', fontFamily: 'sans-serif' }}>
      <article style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 20px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '16px', lineHeight: 1.4 }}>
          地方都市は住みやすいのか？｜<br />データで見る<span style={{ color: '#00d4aa' }}>3つのパターン</span>
        </h1>

        <p style={{ color: '#e8edf5', fontSize: '16px', lineHeight: 1.8, marginBottom: '12px', fontWeight: 600 }}>
          地方都市は一括りにできません。住みやすさはエリアの構造によって大きく異なります。
        </p>
        <p style={{ ...pStyle, marginBottom: '32px' }}>
          「地方＝不便」「都会＝便利」という単純な二元論では、実態を見誤ります。地方都市にも生活利便性が高いエリアは存在し、逆に都市部でも住環境に課題を抱えるケースがあります。この記事では、データから地方都市を3つのパターンに分類し、住みやすさの判断方法を解説します。
        </p>

        <div style={sectionStyle}>
          <h2 style={h2Style}>地方都市の3つのパターン</h2>

          <div style={{ marginBottom: '16px' }}>
            <p style={{ color: '#e8edf5', fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>① コンパクトシティ型</p>
            <p style={pStyle}>
              中心部に行政・商業・医療機能が集約されているタイプです。人口は緩やかに減少していても、中心駅の乗降者数が安定しているケースが多く見られます。
            </p>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              徒歩・自転車圏内で日常生活が完結しやすく、車がなくても暮らせる構造になっている傾向があります。生活コストの低さと利便性が両立しやすいパターンです。
            </p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <p style={{ color: '#e8edf5', fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>② 車依存型</p>
            <p style={pStyle}>
              住宅地が郊外に広がっており、日常の移動が車前提のタイプです。人口はある程度維持されていても、駅の乗降者数が少ない、もしくは最寄り駅が遠いという特徴があります。
            </p>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              ロードサイド型の商業施設が充実しているケースもありますが、高齢化が進むと交通手段の確保が課題になる傾向があります。
            </p>
          </div>

          <div>
            <p style={{ color: '#e8edf5', fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>③ 衰退型</p>
            <p style={pStyle}>
              人口が急激に減少し、商業施設や医療機関の撤退が進んでいるタイプです。駅の乗降者数も減少傾向にあり、生活インフラの維持が難しくなっているケースがあります。
            </p>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              ただし、衰退型であっても自然環境の豊かさや生活コストの低さから、リモートワーク世帯の移住先として選ばれる例も出てきています。
            </p>
          </div>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>NG例：地方と都会の二元論で判断するケース</h2>
          <p style={pStyle}>
            「地方はどこも不便」と思い込んで検討対象から外してしまうのは、機会損失になりえます。コンパクトシティ型の地方都市は、都市部の中規模駅周辺と同等かそれ以上の生活利便性を持つ場合があります。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            逆に「都会なら間違いない」と大型ターミナル駅の近くを選んだ結果、混雑・騒音・家賃の高さに悩まされるケースも珍しくありません。エリアの「構造」をデータで確認することが重要です。
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>データでどう判断するか</h2>
          <p style={pStyle}>
            まず<Link href="/city" style={linkStyle}>市区町村一覧</Link>で対象エリアの人口推移を確認します。10年スパンで緩やかな減少か急激な減少かを見ることで、コンパクトシティ型か衰退型かの目安になります。
          </p>
          <p style={pStyle}>
            次に、<Link href="/station/list" style={linkStyle}>駅一覧</Link>で中心駅の乗降者数推移を確認します。人口が減少していても駅の利用が安定しているなら、中心部の機能は維持されている可能性があります。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            人口が減少しており、かつ駅の乗降者数も大幅に減っている場合は、衰退型の傾向が強いと判断できます。<Link href="/station-ranking" style={linkStyle}>駅乗降者数ランキング</Link>で同規模の他エリアと比較するのも有効です。
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>まとめ</h2>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            地方都市の住みやすさは「地方か都会か」ではなく、エリアの構造で決まります。コンパクトシティ型・車依存型・衰退型の3パターンを意識し、人口推移と乗降者数をデータで確認することで、自分に合ったエリアを見つけやすくなります。
          </p>
        </div>

        <div style={{ ...sectionStyle, textAlign: 'center' as const }}>
          <h2 style={{ ...h2Style, marginBottom: '12px' }}>データでエリアを確認してみる</h2>
          <p style={{ color: '#6b7a99', fontSize: '13px', marginBottom: '16px' }}>
            気になるエリアがあれば、まずデータを確認するところから始めてみてください。
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/city" style={{ display: 'inline-block', color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>市区町村から探す</Link>
            <Link href="/station/list" style={{ display: 'inline-block', color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>駅から探す</Link>
            <Link href="/station-ranking" style={{ display: 'inline-block', color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>ランキングを見る</Link>
            <Link href="/articles" style={{ display: 'inline-block', color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>他の記事を見る</Link>
          </div>
        </div>
      </article>
    </main>
  );
}
