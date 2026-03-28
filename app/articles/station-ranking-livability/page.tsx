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

export default function StationRankingLivabilityPage() {
  return (
    <main style={{ background: '#0a0e1a', minHeight: '100vh', color: '#e8edf5', fontFamily: 'sans-serif' }}>
      <article style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 20px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '16px', lineHeight: 1.4 }}>
          駅ランキングから見る住みやすい街｜<br />乗降者数だけで<span style={{ color: '#00d4aa' }}>判断しない</span>
        </h1>

        <p style={{ color: '#e8edf5', fontSize: '16px', lineHeight: 1.8, marginBottom: '12px', fontWeight: 600 }}>
          乗降者数が多い駅＝住みやすい街、とは限りません。駅のタイプによって住環境はまったく異なります。
        </p>
        <p style={{ ...pStyle, marginBottom: '32px' }}>
          駅の乗降者数ランキングは便利な指標ですが、上位に並ぶ駅がそのまま住みやすい街とイコールではありません。重要なのは、その駅が「どんなタイプの駅か」を見分けることです。
        </p>

        <div style={sectionStyle}>
          <h2 style={h2Style}>駅の3つのタイプ</h2>
          <p style={{ ...pStyle, marginBottom: '20px' }}>
            乗降者数の規模と駅の機能から、大きく3つのタイプに分類できます。住みやすさの評価は、このタイプによって変わります。
          </p>

          <div style={{ marginBottom: '16px' }}>
            <p style={{ color: '#e8edf5', fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>① ターミナル型（乗降者数：30万人以上/日）</p>
            <p style={pStyle}>
              新宿・渋谷・池袋など、複数路線が交差する大型ターミナル駅です。交通利便性は極めて高いですが、利用者の大半は乗り換え・通勤客であり、住環境としては混雑・騒音・家賃の高さが課題になります。
            </p>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              駅周辺の商業施設も観光客・ビジネス客向けが中心で、住民の日常利用には必ずしも向いていないケースがあります。
            </p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <p style={{ color: '#e8edf5', fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>② 住宅特化型（乗降者数：1〜5万人/日）</p>
            <p style={pStyle}>
              住民の通勤・通学利用が中心の駅です。駅前にスーパーやクリニックがあり、住環境としてはバランスが取れている傾向があります。
            </p>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              ただし、乗降者数が少ない分、商業集積は限定的です。飲食店の選択肢が少なかったり、終電が早かったりするケースもあります。
            </p>
          </div>

          <div>
            <p style={{ color: '#e8edf5', fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>③ バランス型（乗降者数：5〜20万人/日）</p>
            <p style={pStyle}>
              交通利便性と住環境のバランスが取れやすいレンジです。商業施設の充実度、交通アクセス、生活インフラが一定水準で揃っているケースが多く見られます。
            </p>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              住みやすさを重視するなら、まずこのレンジの駅から検討するのが効率的な傾向があります。
            </p>
          </div>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>NG例：大規模駅だけで判断するケース</h2>
          <p style={pStyle}>
            「乗降者数ランキング上位の駅なら間違いない」と考えて、ターミナル駅の近くに引越しを決めるケースがあります。しかし実際には、朝晩の駅前の混雑、深夜までの繁華街の騒音、想像以上に高い家賃に悩まされることも少なくありません。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            乗降者数が多いことは「人の流れが多い」ことを示しますが、「住む人にとって快適」であるかとは別の話です。ランキングの順位だけでなく、駅のタイプと自分の生活スタイルとの相性を考えることが重要です。
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>住みやすさを判断する3つの視点</h2>

          <div style={{ marginBottom: '16px' }}>
            <p style={{ color: '#e8edf5', fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>混雑度</p>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              乗降者数が多いほど、駅構内・周辺の混雑は増します。通勤時間帯の混雑だけでなく、休日の人出や夜間の治安も生活に影響します。
            </p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <p style={{ color: '#e8edf5', fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>商業利便性</p>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              ターミナル駅は商業施設が充実していますが、観光客向けが中心のケースもあります。住民にとっての利便性は、スーパー・ドラッグストア・クリニックの有無で判断する方が実用的です。
            </p>
          </div>

          <div>
            <p style={{ color: '#e8edf5', fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>人口推移との整合性</p>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              乗降者数が安定・増加しており、周辺の人口も増えているエリアは、居住需要と利便性が揃っている可能性が高いといえます。<Link href="/city" style={linkStyle}>市区町村一覧</Link>で人口データも合わせて確認してください。
            </p>
          </div>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>AreaScopeでの調べ方</h2>
          <p style={pStyle}>
            <Link href="/station-ranking" style={linkStyle}>駅乗降者数ランキング</Link>で気になるエリアの駅の規模感を確認できます。都道府県別の絞り込みにも対応しています。
          </p>
          <p style={pStyle}>
            <Link href="/station/list" style={linkStyle}>駅一覧</Link>から個別の駅ページへアクセスすると、2011年〜2021年の乗降者数推移を確認できます。増加傾向か減少傾向かを10年スパンで把握できます。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            人口推移は<Link href="/city" style={linkStyle}>市区町村一覧</Link>から確認できます。乗降者数と組み合わせて、駅のタイプとエリアの実態を総合的に判断してください。
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>まとめ</h2>
          <p style={pStyle}>
            駅ランキングの上位＝住みやすい街ではありません。ターミナル型・住宅特化型・バランス型の3タイプを意識し、自分の生活スタイルに合ったタイプの駅を選ぶことが、エリア選びの精度を上げるポイントです。
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
