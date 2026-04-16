import Link from 'next/link';
import type { Metadata } from 'next';
import Breadcrumb from '@/components/Breadcrumb';

export const metadata: Metadata = {
  title: '人口が減っている街の特徴｜AreaScope',
  description: '人口減少エリアの特徴を高齢化・若年層流出の傾向と観光地等の魅力が残るケースで解説します。',
  alternates: {
    canonical: 'https://areascope.jp/articles/population-decline-area-analysis',
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

export default function PopulationDeclineAreaAnalysisPage() {
  return (
    <main style={{ background: '#0a0e1a', minHeight: '100vh', color: '#e8edf5', fontFamily: 'sans-serif' }}>
      <article style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 20px' }}>
        <Breadcrumb items={[
          { label: 'TOP', href: '/' },
          { label: '記事一覧', href: '/articles' },
          { label: '人口が減っている街の特徴' },
        ]} />
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '16px', lineHeight: 1.4 }}>
          人口が減っている街の特徴｜<br />データから見る<span style={{ color: '#00d4aa' }}>エリアの変化</span>
        </h1>

        {/* 結論の一文 */}
        <p style={{ color: '#e8edf5', fontSize: '16px', lineHeight: 1.8, marginBottom: '12px', fontWeight: 600 }}>
          人口が減っているエリアは一見ネガティブに見えますが、その背景や減少の仕方によって評価は大きく変わります。
        </p>

        <p style={{ ...pStyle, marginBottom: '32px' }}>
          「人口減少＝住めないエリア」ではありません。減少の種類を見分けることで、街の実態と将来性を正しく判断できます。本記事では、データをもとに人口減少エリアを分析する方法を解説します。
        </p>

        {/* セクション1：減少の3パターン */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>人口減少の3つのパターン</h2>
          <p style={{ ...pStyle, marginBottom: '16px' }}>
            人口減少には大きく3つのパターンがあります。それぞれ意味が異なるため、一括りに評価するのは避けるべきです。
          </p>

          <div style={{ marginBottom: '16px' }}>
            <p style={{ color: '#e8edf5', fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>① 緩やかな減少（成熟都市型）</p>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              高度成長期に発展した郊外住宅地に多いパターンです。人口のピークは過ぎたものの、インフラや商業施設は整っており、生活環境が急変するリスクは比較的小さい傾向があります。
            </p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <p style={{ color: '#e8edf5', fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>② 急激な減少（衰退エリア型）</p>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              若年層の流出が加速し、高齢化率が30%を超えるようなエリアです。商業施設の撤退やインフラ維持の困難が顕在化しやすく、生活利便性の低下につながる傾向があります。
            </p>
          </div>

          <div>
            <p style={{ color: '#e8edf5', fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>③ 外部需要型（観光地など）</p>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              居住者は減っていても、観光客やビジネス客からの外部需要でエリアの経済が維持されているケースです。人口データだけでは実態が見えにくいため、乗降者数との組み合わせが有効です。
            </p>
          </div>
        </div>

        {/* セクション2：共通する特徴 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>人口減少エリアに見られる共通の傾向</h2>
          <p style={pStyle}>
            高齢化率の上昇は最も分かりやすい指標です。65歳以上の割合が高いエリアでは、自然減（死亡数が出生数を上回る）が加速する傾向があります。
          </p>
          <p style={pStyle}>
            若年層（15〜29歳）の流出も大きな要因です。進学・就職を機に大都市圏へ転出するケースが多く、地域の消費力・労働力の低下につながります。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            その結果、商業施設やスーパーの撤退が起こりやすくなります。こうした変化は人口データの推移から読み取ることができます。
          </p>
        </div>

        {/* セクション3：魅力があるケース＋NG例 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>減少していても魅力があるケース</h2>
          <p style={pStyle}>
            コンパクトシティとして中心部に機能を集約しているエリアでは、人口が減少しても生活利便性が保たれやすい傾向があります。行政・医療・商業が中心部に集まることで、住みやすさが維持されるケースです。
          </p>
          <p style={pStyle}>
            自然環境の豊かさや生活コストの低さから、リモートワーク世帯や移住者に選ばれるエリアも増えています。人口の絶対数だけでなく、どんな人が新たに住んでいるかにも目を向けることが重要です。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            逆に、人口が増えているエリアでも注意が必要なケースがあります。大型マンションの竣工で一時的に人口が急増しても、周辺インフラの整備が追いつかず生活環境が悪化する例は珍しくありません。増加・減少の数字だけでなく、その背景を読むことが大切です。
          </p>
        </div>

        {/* セクション4：判断基準 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>どう判断すればよいか</h2>
          <p style={pStyle}>
            人口データを見る際は、直近1〜2年ではなく10年スパンのトレンドで判断するのが基本です。短期的な増減は一時要因で動くことがあるためです。
          </p>
          <p style={pStyle}>
            減少率のスピードにも注目してください。年0.5%以下の緩やかな減少と、年2%以上の急激な減少では、エリアへの影響がまったく異なります。
          </p>
          <p style={pStyle}>
            総人口だけでなく、生産年齢人口（15〜64歳）の割合も重要な指標です。総人口が横ばいでも生産年齢人口が減少していれば、経済活力は低下傾向にある可能性があります。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            これらを総合的に確認することで、「住めるエリアかどうか」ではなく「どう変化していくエリアか」を判断できるようになります。
          </p>
        </div>

        {/* セクション5：AreaScopeでの調べ方 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>AreaScopeでエリアを調べる</h2>
          <p style={pStyle}>
            <Link href="/city" style={linkStyle}>市区町村一覧</Link>から対象の市区町村を選択すると、1995年〜2020年の人口推移グラフを確認できます。ピーク年や増減率の推移が一目で分かります。
          </p>
          <p style={pStyle}>
            人口の動きと合わせて、<Link href="/station-ranking" style={linkStyle}>駅乗降者数ランキング</Link>で周辺駅の利用状況も確認すれば、そのエリアが「衰退しているのか」「外部需要で支えられているのか」の判断材料になります。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            他のエリア分析記事は<Link href="/articles" style={linkStyle}>記事一覧</Link>からご覧いただけます。
          </p>
        </div>

        {/* まとめ・CTA */}
        <div style={{ ...sectionStyle, textAlign: 'center' as const }}>
          <h2 style={{ ...h2Style, marginBottom: '12px' }}>データでエリアを確認してみる</h2>
          <p style={{ ...pStyle, textAlign: 'left' as const }}>
            人口が減っているエリアにも、成熟都市型・衰退型・外部需要型など多様なパターンがあります。10年スパンの推移、減少率のスピード、生産年齢人口の割合を確認することで、街の実態と将来性をデータで判断できます。
          </p>
          <p style={{ color: '#6b7a99', fontSize: '13px', marginTop: '16px', marginBottom: '16px', textAlign: 'left' as const }}>
            気になるエリアがあれば、まずデータを確認するところから始めてみてください。
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/city" style={{ display: 'inline-block', color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
              市区町村の人口推移を見る
            </Link>
            <Link href="/station-ranking" style={{ display: 'inline-block', color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
              駅ランキングを見る
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
