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

export default function IsPopulationDeclineDangerousPage() {
  return (
    <main style={{ background: '#0a0e1a', minHeight: '100vh', color: '#e8edf5', fontFamily: 'sans-serif' }}>
      <article style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 20px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '16px', lineHeight: 1.4 }}>
          人口減少している街は<br />本当に<span style={{ color: '#00d4aa' }}>危険なのか？</span>
        </h1>

        <p style={{ color: '#e8edf5', fontSize: '16px', lineHeight: 1.8, marginBottom: '12px', fontWeight: 600 }}>
          人口が減っている＝住む価値がない、ではありません。減少の「質」によってエリアの実態は大きく異なります。
        </p>
        <p style={{ ...pStyle, marginBottom: '32px' }}>
          「人口減少」と聞くと衰退や不便さを連想しがちですが、日本の多くの自治体が人口減少フェーズにある現在、減少しているかどうかよりも「どう減っているか」を見ることの方が重要です。この記事では、人口減少エリアを正しく評価する方法を解説します。
        </p>

        <div style={sectionStyle}>
          <h2 style={h2Style}>減少＝危険ではない理由</h2>
          <p style={pStyle}>
            日本全体の人口が減少局面にある以上、人口が減っていること自体は多くの自治体に共通する現象です。2020年国勢調査では、全国約1,700市区町村のうち8割以上が人口減少を記録しています。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            重要なのは、減少のスピード・生活インフラの維持状況・駅の利用動向です。緩やかに減少しながらも生活機能が維持されているエリアと、急速に人口が流出して商業施設が撤退しているエリアでは、住みやすさの評価がまったく異なります。
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>人口減少エリアの3パターン</h2>

          <div style={{ marginBottom: '16px' }}>
            <p style={{ color: '#e8edf5', fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>① 緩やかな減少・機能維持型</p>
            <p style={pStyle}>
              10年で数%程度の緩やかな減少にとどまり、駅の乗降者数も大きく変わっていないパターンです。中心部に商業・医療・行政が集約されたコンパクトシティ型の自治体に多く見られます。
            </p>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              生活インフラが維持されているため、住環境が急変するリスクは比較的小さい傾向があります。
            </p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <p style={{ color: '#e8edf5', fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>② 急激な減少・インフラ縮小型</p>
            <p style={pStyle}>
              10年で10%以上の減少が見られ、商業施設の撤退やバス路線の廃止が進んでいるパターンです。若年層の流出が加速し、高齢化率が30%を大きく超えるエリアに多い傾向があります。
            </p>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              駅の乗降者数も減少傾向にある場合、エリア全体の需要縮小が進んでいると判断しやすいです。
            </p>
          </div>

          <div>
            <p style={{ color: '#e8edf5', fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>③ 外部需要で支えられている型</p>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              居住者は減少しているが、観光客やビジネス客の流入でエリアの経済が維持されているパターンです。駅の乗降者数が安定・増加している場合はこのタイプの可能性があります。ただし、居住環境としての評価は別軸で判断する必要があります。
            </p>
          </div>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>地方都市と大都市圏の違い</h2>
          <p style={pStyle}>
            地方都市の人口減少は、若年層の大都市圏への流出が主因であることが多いです。一方、大都市圏の郊外で人口が減少している場合は、高度成長期に開発されたニュータウンの高齢化が要因であるケースが目立ちます。
          </p>
          <p style={pStyle}>
            同じ「人口減少」でも、背景が異なれば対策も将来の見通しも変わります。地方都市ではコンパクトシティ化で機能を維持するケースがある一方、大都市圏郊外では再開発で回復に転じるケースもあります。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            「地方だから衰退」「都市圏だから安全」という単純な区分けでは判断できません。
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>NG例：人口が減っている＝住む価値がないという判断</h2>
          <p style={pStyle}>
            人口減少データだけを見て「この街はもうダメだ」と判断してしまうのは、最も避けるべきパターンです。実際には、緩やかに減少しながらも生活利便性が高く、家賃や生活コストが抑えられるエリアは数多く存在します。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            人口が増えているエリアにも、家賃高騰・混雑・インフラ不足といった課題はあります。減少か増加かの二択ではなく、「どう変化しているか」「生活機能は維持されているか」を総合的に見ることが重要です。
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>データでどう判断するか</h2>
          <p style={pStyle}>
            <Link href="/city" style={linkStyle}>市区町村一覧</Link>から候補エリアの人口推移を確認します。10年スパンで年0.5%以下の緩やかな減少なら、生活環境が急変するリスクは比較的小さいと判断しやすいです。
          </p>
          <p style={pStyle}>
            合わせて、<Link href="/station/list" style={linkStyle}>駅一覧</Link>から最寄り駅の乗降者数推移を確認します。人口が減少していても乗降者数が安定しているなら、交通需要は維持されている可能性があります。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            <Link href="/station-ranking" style={linkStyle}>駅乗降者数ランキング</Link>で同規模のエリアと比較し、相対的な位置づけを把握するのも有効です。
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>まとめ</h2>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            人口減少＝危険ではありません。減少の速度、生活インフラの維持状況、駅利用の動向を確認することで、減少しても住みやすい街と、実際に衰退が進んでいる街を見分けることができます。数字の増減だけでなく「変化の質」を見ることが、データに基づくエリア判断の基本です。
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
