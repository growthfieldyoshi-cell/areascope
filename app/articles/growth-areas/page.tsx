import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '成長エリア分析の記事一覧｜人口増加×人流データで見る',
  description: '人口推移、駅乗降者数、人流データを掛け合わせた成長エリア分析の記事一覧です。全国版記事と都道府県別ランキングへの入口をまとめています。',
  alternates: {
    canonical: 'https://areascope.jp/articles/growth-areas',
  },
  openGraph: {
    type: 'website',
    title: '成長エリア分析の記事一覧｜人口増加×人流データで見る',
    description: '人口推移、駅乗降者数、人流データを掛け合わせた成長エリア分析の記事一覧です。全国版記事と都道府県別ランキングへの入口をまとめています。',
    url: 'https://areascope.jp/articles/growth-areas',
    siteName: 'AreaScope',
  },
};

const cardStyle = {
  background: '#111827',
  border: '1px solid #1e2d45',
  borderRadius: '12px',
  padding: '24px',
  textDecoration: 'none' as const,
  color: '#e8edf5',
  display: 'flex' as const,
  flexDirection: 'column' as const,
  gap: '8px',
};

const h2Style = {
  fontSize: '20px',
  fontWeight: 700 as const,
  color: '#00d4aa',
  marginBottom: '8px',
};

const sectionDescStyle = {
  color: '#6b7a99',
  fontSize: '13px',
  lineHeight: 1.7,
  marginBottom: '16px',
};

const btnStyle = {
  display: 'inline-block' as const,
  color: '#00d4aa',
  border: '1px solid #00d4aa',
  borderRadius: '6px',
  padding: '8px 16px',
  textDecoration: 'none' as const,
  fontSize: '13px',
  fontWeight: 700 as const,
};

const SAMPLE_PREFS = [
  { slug: 'tokyo', name: '東京都' },
  { slug: 'osaka', name: '大阪府' },
  { slug: 'kanagawa', name: '神奈川県' },
  { slug: 'aichi', name: '愛知県' },
  { slug: 'fukuoka', name: '福岡県' },
];

function ArticleCard({ href, title, description }: { href: string; title: string; description: string }) {
  return (
    <Link href={href} className="article-card" style={cardStyle}>
      <div style={{ fontSize: '15px', fontWeight: 700, lineHeight: 1.5 }}>{title}</div>
      <div style={{ color: '#aaa', fontSize: '13px', lineHeight: 1.7 }}>{description}</div>
      <div style={{ color: '#00d4aa', fontSize: '13px', marginTop: 'auto', paddingTop: '6px' }}>
        記事を読む &rarr;
      </div>
    </Link>
  );
}

function PrefGuideCard({ basePath, title, description }: { basePath: string; title: string; description: string }) {
  return (
    <div style={{ ...cardStyle, textDecoration: 'none' }}>
      <div style={{ fontSize: '15px', fontWeight: 700, lineHeight: 1.5 }}>{title}</div>
      <div style={{ color: '#aaa', fontSize: '13px', lineHeight: 1.7 }}>{description}</div>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
        {SAMPLE_PREFS.map((p) => (
          <Link key={p.slug} href={`${basePath}/${p.slug}`} style={{ fontSize: '11px', color: '#00d4aa', background: 'rgba(0,212,170,0.08)', border: '1px solid #1e2d45', borderRadius: '4px', padding: '3px 8px', textDecoration: 'none' }}>
            {p.name}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function GrowthAreasHubPage() {
  return (
    <main style={{ background: '#0a0e1a', minHeight: '100vh', color: '#e8edf5', fontFamily: 'sans-serif' }}>
      <style>{`
        .articles-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        .articles-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .article-card:hover { border-color: #00d4aa !important; }
        @media (max-width: 768px) {
          .articles-grid { grid-template-columns: 1fr; }
          .articles-grid-3 { grid-template-columns: 1fr; }
        }
      `}</style>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 20px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '12px' }}>
          <span style={{ color: '#00d4aa' }}>成長エリア分析</span>の記事一覧
        </h1>
        <p style={{ color: '#aaa', fontSize: '14px', lineHeight: 1.8, marginBottom: '40px' }}>
          人口増加率と駅乗降者数を掛け合わせて、エリアの成長性を多角的に分析する記事をまとめています。「人口が増えている＝強い街」「人口が減っている＝弱い街」と単純化せず、データの組み合わせで街の実態を読み解きます。
        </p>

        {/* 全国版の成長エリア分析 */}
        <section style={{ marginBottom: '48px' }}>
          <h2 style={h2Style}>全国版の成長エリア分析</h2>
          <p style={sectionDescStyle}>人口増加率と駅乗降者数を掛け合わせたスコアで、全国の成長エリアを分析する記事です。</p>
          <div className="articles-grid">
            <ArticleCard
              href="/articles/population-passengers-cross-analysis"
              title="人口増加×駅乗降者数で見る成長エリアランキング"
              description="人口が増えていて、かつ駅利用も多いエリアをスコア化してTOP20を紹介。居住需要と人流需要の両方が伴う成長エリアを可視化。"
            />
            <ArticleCard
              href="/articles/population-growth-low-passenger-analysis"
              title="人口は増えているのに駅利用が弱い街ランキング"
              description="人口増加率と駅利用のギャップから、車社会・郊外住宅地型の成長エリアを可視化。見かけの人口増と実需の違いを分析。"
            />
            <ArticleCard
              href="/articles/population-decline-high-passenger-analysis"
              title="人口は減っているのに人流が強い街ランキング"
              description="人口減少でも駅利用が活発な街を抽出。観光地・商業集積地・オフィス街など、居住以外の需要で成り立つエリアを分析。"
            />
          </div>
        </section>

        {/* 都道府県別の成長エリアランキング */}
        <section style={{ marginBottom: '48px' }}>
          <h2 style={h2Style}>都道府県別の成長エリアランキング</h2>
          <p style={sectionDescStyle}>全国版の分析を都道府県別に展開したページです。各テーマで全47都道府県分のページがあります。</p>
          <div className="articles-grid">
            <PrefGuideCard
              basePath="/articles/growth-area-ranking"
              title="都道府県別 人口増×人流増 成長エリアランキング"
              description="県内で人口増加率と駅乗降者数を掛け合わせた成長エリアをランキングで確認できます。"
            />
            <PrefGuideCard
              basePath="/articles/population-decline-high-passenger"
              title="都道府県別 人口減×人流強い街ランキング"
              description="県内で人口は減っているのに駅利用が強い街をランキングで確認できます。"
            />
          </div>
        </section>

        {/* 関連データを見る */}
        <section style={{ marginBottom: '48px' }}>
          <h2 style={h2Style}>関連データを見る</h2>
          <p style={sectionDescStyle}>成長エリア分析に関連するデータページや記事です。</p>
          <div className="articles-grid-3">
            <Link href="/articles/station-passenger-recovery-analysis" className="article-card" style={cardStyle}>
              <div style={{ fontSize: '15px', fontWeight: 700 }}>駅乗降者数の回復率ランキング</div>
              <div style={{ color: '#aaa', fontSize: '13px', lineHeight: 1.7 }}>コロナ前後の駅利用の回復状況をランキング形式で確認できます。</div>
              <div style={{ color: '#00d4aa', fontSize: '13px', marginTop: 'auto', paddingTop: '6px' }}>記事を読む →</div>
            </Link>
            <Link href="/station-ranking" className="article-card" style={cardStyle}>
              <div style={{ fontSize: '15px', fontWeight: 700 }}>全国駅ランキング</div>
              <div style={{ color: '#aaa', fontSize: '13px', lineHeight: 1.7 }}>全国の駅を乗降者数順にランキングで比較できます。</div>
              <div style={{ color: '#00d4aa', fontSize: '13px', marginTop: 'auto', paddingTop: '6px' }}>/station-ranking →</div>
            </Link>
            <Link href="/population" className="article-card" style={cardStyle}>
              <div style={{ fontSize: '15px', fontWeight: 700 }}>人口分析</div>
              <div style={{ color: '#aaa', fontSize: '13px', lineHeight: 1.7 }}>市区町村の人口推移をグラフで確認できます。</div>
              <div style={{ color: '#00d4aa', fontSize: '13px', marginTop: 'auto', paddingTop: '6px' }}>/population →</div>
            </Link>
          </div>
        </section>

        {/* まとめ */}
        <section style={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: '12px', padding: '28px', marginBottom: '48px' }}>
          <h2 style={h2Style}>AreaScopeの成長エリア分析とは</h2>
          <p style={{ color: '#aaa', fontSize: '14px', lineHeight: 1.8, marginBottom: '12px' }}>
            AreaScopeでは、国土交通省の駅乗降者数と総務省の人口データを掛け合わせて、エリアの成長性を多角的に評価しています。人口増加率だけ、乗降者数だけでは見えない「街の実態」を可視化するのが特徴です。
          </p>
          <p style={{ color: '#aaa', fontSize: '14px', lineHeight: 1.8, marginBottom: 0 }}>
            引越し先の検討、不動産投資の判断、商圏分析など、データに基づいたエリア選定にご活用ください。
          </p>
        </section>

        {/* フッター */}
        <div style={{ borderTop: '1px solid #1e2d45', paddingTop: '24px' }}>
          <p style={{ color: '#6b7a99', fontSize: '12px', marginBottom: '12px', fontFamily: 'monospace', letterSpacing: '2px' }}>// 関連ページ</p>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <Link href="/articles" style={{ color: '#00d4aa', textDecoration: 'none', fontSize: '13px' }}>記事一覧に戻る</Link>
            <Link href="/articles/prefecture-ranking" style={{ color: '#00d4aa', textDecoration: 'none', fontSize: '13px' }}>都道府県別駅ランキング一覧</Link>
            <Link href="/station-ranking" style={{ color: '#00d4aa', textDecoration: 'none', fontSize: '13px' }}>全国駅ランキング</Link>
            <Link href="/population-ranking" style={{ color: '#00d4aa', textDecoration: 'none', fontSize: '13px' }}>人口増加ランキングを見る</Link>
            <Link href="/population-decline-ranking" style={{ color: '#00d4aa', textDecoration: 'none', fontSize: '13px' }}>人口減少ランキングを見る</Link>
            <Link href="/city" style={{ color: '#00d4aa', textDecoration: 'none', fontSize: '13px' }}>市区町村一覧を見る</Link>
            <Link href="/prefecture" style={{ color: '#00d4aa', textDecoration: 'none', fontSize: '13px' }}>都道府県別のエリア分析を見る</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
