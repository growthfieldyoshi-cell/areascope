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

export default function HowToChooseFamilyFriendlyCityPage() {
  return (
    <main style={{ background: '#0a0e1a', minHeight: '100vh', color: '#e8edf5', fontFamily: 'sans-serif' }}>
      <article style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 20px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '16px', lineHeight: 1.4 }}>
          ファミリー向けの街の選び方｜<br /><span style={{ color: '#00d4aa' }}>失敗しない</span>判断基準
        </h1>

        <p style={{ color: '#e8edf5', fontSize: '16px', lineHeight: 1.8, marginBottom: '12px', fontWeight: 600 }}>
          ファミリー向けの街選びでは、家賃だけでなく「人口構成」「生活インフラ」「通勤のしやすさ」の3つを合わせて見ることが重要です。
        </p>
        <p style={{ ...pStyle, marginBottom: '32px' }}>
          子育て世帯のエリア選びは、単身者とは判断基準が異なります。学校や医療機関の充実度、周辺の子育て世帯の多さ、通勤と生活の両立しやすさなど、複数の条件を同時に満たすエリアを見つける必要があります。この記事では、データを使ってファミリー向けの街を判断する方法を解説します。
        </p>

        <div style={sectionStyle}>
          <h2 style={h2Style}>ファミリー向けエリアの3つの条件</h2>

          <div style={{ marginBottom: '16px' }}>
            <p style={{ color: '#e8edf5', fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>① 人口が安定〜増加している</p>
            <p style={pStyle}>
              人口が増えているエリア、特に若年層や子育て世代の転入が続いているエリアは、住宅需要が高く生活インフラが充実しやすい傾向があります。
            </p>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              逆に人口が急減しているエリアでは、学校の統廃合や小児科の閉院が起きやすくなります。10年スパンの人口推移で安定性を確認することが基本です。
            </p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <p style={{ color: '#e8edf5', fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>② 生活インフラが揃っている</p>
            <p style={pStyle}>
              スーパー・ドラッグストア・小児科・公園など、子育てに必要な施設が徒歩圏内にあるかどうかは日常の利便性に直結します。
            </p>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              駅の乗降者数が5万〜15万人程度の中規模駅周辺は、住民向けの商業施設が充実しているケースが多く、ファミリーにとっての生活利便性が高い傾向があります。
            </p>
          </div>

          <div>
            <p style={{ color: '#e8edf5', fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>③ 通勤と生活が両立できる</p>
            <p style={pStyle}>
              共働き世帯が増えている現在、通勤先へのアクセスは重要な判断基準です。乗り換えなしで通勤先に着ける路線沿いを選ぶことで、通勤負荷を大幅に軽減できます。
            </p>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              乗降者数が極端に多いターミナル駅は混雑が激しく、ベビーカーでの移動が困難な場合もあります。混雑を避けつつアクセスが確保できる駅を選ぶことが、ファミリーにとっての実用的な通勤のしやすさです。
            </p>
          </div>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>ファミリー向けエリアの3パターン</h2>

          <div style={{ marginBottom: '16px' }}>
            <p style={{ color: '#e8edf5', fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>成長型ベッドタウン</p>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              人口が増加傾向で、新しい住宅地開発が進んでいるエリアです。保育施設や学校の新設が追いついているケースもあり、子育て環境が整備されやすい傾向があります。ただし急激な人口増加の場合、インフラ整備が追いつかないリスクもあります。
            </p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <p style={{ color: '#e8edf5', fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>成熟型住宅地</p>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              人口は横ばい〜微減でも、長年の住宅地として商業・医療・教育のインフラが安定しているエリアです。地域コミュニティが成熟しており、子育て支援の仕組みが整っている場合があります。
            </p>
          </div>

          <div>
            <p style={{ color: '#e8edf5', fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>都心近接型</p>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              都心まで20〜30分圏内の、利便性と住環境のバランスが取れたエリアです。家賃は都心より抑えられ、通勤時間も許容範囲内に収まるケースが多いです。駅の乗降者数が中規模で、住民向け施設が充実しているかを確認することがポイントです。
            </p>
          </div>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>NG例：家賃の安さだけで判断するケース</h2>
          <p style={pStyle}>
            「家賃が安いから」という理由だけで郊外のエリアを選んだ結果、最寄り駅の本数が少なく通勤に片道90分以上かかる、小児科が車で30分離れている、という事態は珍しくありません。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            家賃は重要な条件ですが、通勤時間・生活インフラ・エリアの将来性と合わせて総合的に判断しなければ、「安いけど不便で住み続けられない」という結果になりかねません。
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>AreaScopeでの調べ方</h2>
          <p style={pStyle}>
            <Link href="/city" style={linkStyle}>市区町村一覧</Link>から候補エリアの人口推移を確認します。10年スパンで安定〜増加しているかどうかが、子育て環境の持続性を測る基本指標です。
          </p>
          <p style={pStyle}>
            <Link href="/station/list" style={linkStyle}>駅一覧</Link>から最寄り駅の乗降者数推移を確認します。5万〜15万人程度で安定していれば、住民向けの生活インフラが維持されやすい傾向があります。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            <Link href="/station-ranking" style={linkStyle}>駅乗降者数ランキング</Link>で候補エリアの駅を都道府県別に比較し、通勤路線の混雑規模を把握するのもおすすめです。
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>まとめ</h2>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            ファミリー向けの街選びでは、家賃の安さだけで判断せず、人口の安定性・生活インフラの充実度・通勤のしやすさの3つを合わせて確認することが重要です。データでエリアの実態を把握した上で、家族の条件に合った街を選ぶことが、長く住み続けられるエリア選びにつながります。
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
