import Link from 'next/link';
import type { Metadata } from 'next';
import Breadcrumb from '@/components/Breadcrumb';

export const metadata: Metadata = {
  title: '乗降者数が多い駅は住みやすい？｜AreaScope',
  description: '乗降者数が多い駅周辺の便利さとデメリットをデータで分析し判断方法を解説します。',
  alternates: {
    canonical: 'https://areascope.jp/articles/station-passengers-livability',
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

export default function StationPassengersLivabilityPage() {
  return (
    <main style={{ background: '#0a0e1a', minHeight: '100vh', color: '#e8edf5', fontFamily: 'sans-serif' }}>
      <article style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 20px' }}>
        <Breadcrumb items={[
          { label: 'TOP', href: '/' },
          { label: '記事一覧', href: '/articles' },
          { label: '乗降者数が多い駅は住みやすい？' },
        ]} />
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '16px', lineHeight: 1.4 }}>
          乗降者数が多い駅は住みやすい？<br />データで見る<span style={{ color: '#00d4aa' }}>街の実態</span>
        </h1>

        {/* フック */}
        <p style={{ color: '#e8edf5', fontSize: '16px', lineHeight: 1.8, marginBottom: '12px', fontWeight: 600 }}>
          乗降者数が多い駅＝住みやすいとは限りません。
        </p>

        <p style={pStyle}>
          利用者が多い駅ほど便利に感じるのは自然ですが、「便利さ」と「住みやすさ」は別の話です。混雑・騒音・家賃の高さなど、乗降者数が多いからこそ発生するデメリットもあります。
        </p>
        <p style={{ ...pStyle, marginBottom: '32px' }}>
          この記事では、乗降者数と住みやすさの関係をデータで整理し、何を見れば判断できるのかを解説します。
        </p>

        {/* メリット */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>乗降者数が多いエリアのメリット</h2>
          <p style={pStyle}>
            乗降者数が多い駅の周辺は、交通利便性が高い傾向があります。複数路線が乗り入れる駅では通勤・通学の選択肢が増え、遅延時の代替手段も確保しやすくなります。
          </p>
          <p style={pStyle}>
            利用者が多い駅の周辺には商業施設や飲食店が集まりやすく、日常の買い物や外食の利便性が高まります。医療機関や行政サービスも集積する傾向があります。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            雇用へのアクセスも有利です。オフィス集積地への通勤時間が短くなり、転職時の選択肢も広がります。
          </p>
        </div>

        {/* デメリット＋NG例 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>デメリット・注意すべき点</h2>
          <p style={pStyle}>
            最も分かりやすいデメリットは混雑と騒音です。朝夕のラッシュ時の駅前の人混み、終電後の繁華街の喧騒は、生活環境としてストレスになりやすい要因です。
          </p>
          <p style={pStyle}>
            家賃や不動産価格も高くなる傾向があります。利便性がそのまま価格に反映されるため、同じ広さの住居でも郊外と比べて大幅にコストが上がるケースが一般的です。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            特に1日100万人を超えるような超大型ターミナル駅は要注意です。利用者の大半は乗り換え客や通勤客であり、駅周辺の商業施設も観光客・ビジネス客向けが中心になりがちです。乗降者数が多くても「住む人にとって便利」とは限らない典型例といえます。
          </p>
        </div>

        {/* 通過型 vs 生活型 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>「通過型」と「生活型」の違い</h2>
          <p style={pStyle}>
            駅の利用実態には大きく「通過型」と「生活型」の2種類があります。この違いを理解すると、乗降者数の意味がより正確に読めるようになります。
          </p>

          <div style={{ marginBottom: '16px' }}>
            <p style={{ color: '#e8edf5', fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>通過型（例：新宿・渋谷など大型ターミナル）</p>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              乗り換え需要が大きく、駅を利用する人の多くはその街に「住んでいない」ケースです。乗降者数は非常に多いものの、住環境としての評価は別軸で考える必要があります。
            </p>
          </div>

          <div>
            <p style={{ color: '#e8edf5', fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>生活型（郊外の中規模駅）</p>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              通勤・買い物・通院など、住民の日常利用が中心の駅です。乗降者数は大型ターミナルに比べると少ないものの、駅周辺に住民向けの商業施設が充実していることが多く、住みやすさとのバランスが取れやすい傾向があります。
            </p>
          </div>
        </div>

        {/* バランスの見方＋目安 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>住みやすさのバランスをどう見るか</h2>
          <p style={pStyle}>
            一般的に、1日あたり5万〜20万人程度の中規模駅周辺が、利便性と住環境のバランスが良い傾向があるとされています。大規模ターミナルほどの混雑はなく、商業施設や交通アクセスは一定水準を保っているケースが多いためです。
          </p>
          <p style={pStyle}>
            ただし、数字だけで住みやすさは判断できません。乗降者数の推移に加えて、周辺の人口推移も確認することが重要です。
          </p>
          <p style={pStyle}>
            乗降者数が安定・増加しており、かつ人口も増加傾向にあるエリアは、居住需要と生活利便性の両面が揃っている可能性が高いといえます。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            逆に、乗降者数が増えていても人口が減少しているエリアは、観光・通過型の利用が中心の可能性があります。人口データとの組み合わせ方は<Link href="/articles/how-to-find-population-growth-area" style={linkStyle}>人口が増えている街の見つけ方</Link>でも詳しく解説しています。
          </p>
        </div>

        {/* AreaScopeでの調べ方 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>AreaScopeでデータを確認する</h2>
          <p style={pStyle}>
            <Link href="/station-ranking" style={linkStyle}>駅乗降者数ランキング</Link>で気になる駅の利用規模を確認できます。都道府県別の絞り込みにも対応しているため、住みたいエリアの駅を比較するのに便利です。
          </p>
          <p style={pStyle}>
            エリアの人口動態は<Link href="/city" style={linkStyle}>市区町村一覧</Link>から確認できます。乗降者数と人口推移を見比べることで、そのエリアが「住む人に選ばれているか」の判断材料になります。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            個別の駅データは<Link href="/station" style={linkStyle}>駅検索</Link>から駅名で検索して、時系列の乗降者数推移を確認してください。
          </p>
        </div>

        {/* まとめ・CTA */}
        <div style={{ ...sectionStyle, textAlign: 'center' as const }}>
          <h2 style={{ ...h2Style, marginBottom: '12px' }}>データでエリアを確認してみる</h2>
          <p style={{ ...pStyle, textAlign: 'left' as const }}>
            乗降者数が多い駅は利便性が高い反面、混雑・騒音・コストの面でデメリットもあります。「通過型」と「生活型」の違いを意識し、乗降者数の推移と人口データを組み合わせることで、住みやすさをデータで判断できるようになります。
          </p>
          <p style={{ color: '#6b7a99', fontSize: '13px', marginTop: '16px', marginBottom: '16px', textAlign: 'left' as const }}>
            気になるエリアがあれば、まずデータを確認するところから始めてみてください。
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/station-ranking" style={{ display: 'inline-block', color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
              駅ランキングを見る
            </Link>
            <Link href="/city" style={{ display: 'inline-block', color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
              市区町村データを見る
            </Link>
            <Link href="/station" style={{ display: 'inline-block', color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
              駅一覧を見る
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
