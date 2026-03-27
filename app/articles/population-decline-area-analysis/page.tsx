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

export default function PopulationDeclineAreaAnalysisPage() {
  return (
    <main style={{ background: '#0a0e1a', minHeight: '100vh', color: '#e8edf5', fontFamily: 'sans-serif' }}>
      <article style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 20px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '16px', lineHeight: 1.4 }}>
          人口が減っている街の特徴｜<br />データから見る<span style={{ color: '#00d4aa' }}>エリアの変化</span>
        </h1>
        <p style={{ ...pStyle, marginBottom: '32px' }}>
          人口減少はネガティブな印象を持たれがちですが、必ずしもそのエリアに魅力がないことを意味するわけではありません。データを正しく読むことで、街の実態や変化の背景が見えてきます。
        </p>

        <div style={sectionStyle}>
          <h2 style={h2Style}>人口減少エリアに多い特徴</h2>
          <p style={pStyle}>
            人口が減少傾向にあるエリアには、いくつかの共通した特徴が見られます。まず高齢化率の上昇です。65歳以上の割合が30%を超えるエリアでは、自然減（死亡数が出生数を上回る）が加速する傾向があります。
          </p>
          <p style={pStyle}>
            次に、若年層（15〜29歳）の流出です。進学・就職を機に大都市圏へ転出するケースが多く、地方圏では特にこの傾向が顕著です。若年層が減ると、地域の消費力・労働力が低下し、商業施設の縮小につながりやすくなります。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            商業施設やスーパーの撤退は、住環境の利便性低下に直結します。こうした変化は人口データの推移から読み取ることができます。
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>人口が減っていても魅力があるケース</h2>
          <p style={pStyle}>
            人口減少＝魅力のないエリア、とは限りません。観光地として外部からの需要が大きいエリアでは、居住者は減っていても経済的な活力が維持されているケースがあります。
          </p>
          <p style={pStyle}>
            また、コンパクトシティとして中心部に機能を集約しているエリアでは、人口が減少しても生活利便性が保たれやすい傾向があります。行政サービスや医療機関が中心部に集まっていることで、住みやすさが維持されるケースです。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            さらに、自然環境の豊かさや生活コストの低さから、リモートワーク世帯や移住者に選ばれるエリアも出てきています。人口の絶対数だけでなく、どんな人が住んでいるかにも目を向けることが重要です。
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>データの正しい見方</h2>
          <p style={pStyle}>
            人口データを見る際は、直近1〜2年ではなく10年スパンのトレンドで判断するのが基本です。短期的な増減は大型マンションの竣工や災害など一時要因で動くことがあるためです。
          </p>
          <p style={pStyle}>
            また、同じ減少でも「急激に減っている」のと「緩やかに減少している」のでは意味が異なります。急減はインフラの維持困難につながる可能性がありますが、緩やかな減少であれば生活環境が急変するリスクは比較的小さいといえます。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            総人口だけでなく、生産年齢人口（15〜64歳）の割合にも注目してください。総人口が横ばいでも生産年齢人口が減少していれば、エリアの経済活力は低下傾向にある可能性があります。
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>AreaScopeでエリアを調べる</h2>
          <p style={pStyle}>
            <Link href="/city" style={linkStyle}>市区町村一覧</Link>から対象の市区町村を選択すると、1995年〜2020年の人口推移グラフを確認できます。ピーク年や増減率の推移が一目で分かります。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            人口の動きと合わせて、<Link href="/station-ranking" style={linkStyle}>駅乗降者数ランキング</Link>で周辺駅の利用状況も確認すれば、エリアの実態をより正確に把握できます。
          </p>
        </div>

        <div style={{ ...sectionStyle, textAlign: 'center' as const }}>
          <h2 style={{ ...h2Style, marginBottom: '12px' }}>まとめ</h2>
          <p style={{ ...pStyle, textAlign: 'left' as const }}>
            人口が減っているエリアにも、観光需要やコンパクトシティ化など多様な背景があります。データを10年スパンで確認し、減少の速度や生産年齢人口の割合を見ることで、街の実態と将来性をより正確に判断できます。
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '20px' }}>
            <Link href="/city" style={{ display: 'inline-block', color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
              市区町村の人口推移を調べる
            </Link>
            <Link href="/station-ranking" style={{ display: 'inline-block', color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
              駅乗降者数ランキングを見る
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
