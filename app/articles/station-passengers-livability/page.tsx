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

export default function StationPassengersLivabilityPage() {
  return (
    <main style={{ background: '#0a0e1a', minHeight: '100vh', color: '#e8edf5', fontFamily: 'sans-serif' }}>
      <article style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 20px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '16px', lineHeight: 1.4 }}>
          乗降者数が多い駅は住みやすい？<br />データで見る<span style={{ color: '#00d4aa' }}>街の実態</span>
        </h1>
        <p style={{ ...pStyle, marginBottom: '32px' }}>
          「乗降者数が多い駅の近くなら便利で住みやすいはず」と考える方は多いですが、実態はより複雑です。メリットとデメリットの両面をデータから整理し、住みやすさを判断するポイントを解説します。
        </p>

        <div style={sectionStyle}>
          <h2 style={h2Style}>乗降者数が多いエリアのメリット</h2>
          <p style={pStyle}>
            乗降者数が多い駅の周辺は、交通利便性が高い傾向があります。複数路線が乗り入れる駅では通勤・通学の選択肢が増え、遅延時の代替手段も確保しやすくなります。
          </p>
          <p style={pStyle}>
            利用者が多い駅の周辺には商業施設や飲食店が集まりやすく、日常の買い物や外食の利便性が高まります。医療機関や行政サービスも集積する傾向があり、生活インフラ全体の充実度が高いケースが多いです。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            雇用へのアクセスという点でも、乗降者数の多い駅は有利です。オフィスが集積するエリアへのアクセスが良いため、通勤時間の短縮や転職時の選択肢の広さにつながります。
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>デメリット・注意すべき点</h2>
          <p style={pStyle}>
            一方で、乗降者数が多い駅の周辺にはデメリットもあります。最も分かりやすいのは混雑と騒音です。朝夕のラッシュ時の駅前の人混み、終電後の繁華街の喧騒など、生活環境としてストレスになる要因が増えます。
          </p>
          <p style={pStyle}>
            家賃や不動産価格も高くなる傾向があります。利便性の高さがそのまま価格に反映されるため、同じ広さの住居でも郊外と比べて大幅にコストが上がるケースが一般的です。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            また、超大型ターミナル駅は「通過型」の利用者が多く、住民が日常的に使う商業施設よりも観光客・ビジネス客向けの施設が中心になることがあります。乗降者数が多いことと「住む人にとって便利」であることは必ずしも一致しません。
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>住みやすさのバランスをどう見るか</h2>
          <p style={pStyle}>
            住みやすさと利便性のバランスが取れやすいのは、1日あたり5万〜20万人程度の中規模駅周辺だという見方があります。大規模ターミナルほどの混雑はなく、それでいて商業施設や交通アクセスは一定水準を保っているケースが多いためです。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            ただし、数字だけで住みやすさは判断できません。乗降者数の推移に加えて、周辺の人口推移も確認することをおすすめします。乗降者数が安定しており、かつ人口も増加傾向にあるエリアは、居住需要と生活利便性の両面が揃っている可能性が高いといえます。
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>AreaScopeでデータを確認する</h2>
          <p style={pStyle}>
            <Link href="/station-ranking" style={linkStyle}>駅乗降者数ランキング</Link>で気になる駅の利用規模を確認できます。都道府県別の絞り込みにも対応しています。
          </p>
          <p style={pStyle}>
            エリアの人口動態は<Link href="/city" style={linkStyle}>市区町村一覧</Link>から確認できます。乗降者数と人口推移を見比べることで、そのエリアが「住む人に選ばれているか」の判断材料になります。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            個別の駅データは<Link href="/station" style={linkStyle}>駅検索</Link>から駅名で検索して、時系列の乗降者数推移を確認してください。
          </p>
        </div>

        <div style={{ ...sectionStyle, textAlign: 'center' as const }}>
          <h2 style={{ ...h2Style, marginBottom: '12px' }}>まとめ</h2>
          <p style={{ ...pStyle, textAlign: 'left' as const }}>
            乗降者数が多い駅は利便性が高い反面、混雑・騒音・コストの面でデメリットもあります。住みやすさを判断するには、乗降者数の絶対値だけでなく推移を確認し、人口データと組み合わせてエリアの実態を見ることが大切です。
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '20px' }}>
            <Link href="/station-ranking" style={{ display: 'inline-block', color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
              駅乗降者数ランキングを見る
            </Link>
            <Link href="/city" style={{ display: 'inline-block', color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
              市区町村の人口推移を見る
            </Link>
            <Link href="/articles" style={{ display: 'inline-block', color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
              記事一覧に戻る
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}
