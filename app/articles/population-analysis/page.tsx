import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '人口分析の記事一覧｜AreaScope',
  description: 'AreaScopeの人口分析の記事一覧です。人口推移、人口増加・減少自治体ランキング、人口と駅データを組み合わせた分析コンテンツをまとめています。',
  alternates: {
    canonical: 'https://areascope.jp/articles/population-analysis',
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

const SAMPLE_PREFS = [
  { slug: 'tokyo', name: '東京都' },
  { slug: 'osaka', name: '大阪府' },
  { slug: 'kanagawa', name: '神奈川県' },
  { slug: 'aichi', name: '愛知県' },
  { slug: 'fukuoka', name: '福岡県' },
];

function ArticleCard({ href, title, description, linkLabel }: { href: string; title: string; description: string; linkLabel?: string }) {
  return (
    <Link href={href} className="article-card" style={cardStyle}>
      <div style={{ fontSize: '15px', fontWeight: 700, lineHeight: 1.5 }}>{title}</div>
      <div style={{ color: '#aaa', fontSize: '13px', lineHeight: 1.7 }}>{description}</div>
      <div style={{ color: '#00d4aa', fontSize: '13px', marginTop: 'auto', paddingTop: '6px' }}>
        {linkLabel ?? '記事を読む'} &rarr;
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

export default function PopulationAnalysisHubPage() {
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
          <span style={{ color: '#00d4aa' }}>人口分析</span>の記事一覧
        </h1>
        <p style={{ color: '#aaa', fontSize: '14px', lineHeight: 1.8, marginBottom: '40px' }}>
          市区町村の人口推移データをもとにした分析記事をまとめています。人口増加・減少の自治体ランキングや、人口と駅乗降者数を掛け合わせたエリア分析など、人口データの多角的な読み解き方を掲載しています。
        </p>

        {/* 全国版・基礎分析 */}
        <section style={{ marginBottom: '48px' }}>
          <h2 style={h2Style}>全国版・基礎分析</h2>
          <p style={sectionDescStyle}>人口推移の確認ツールと、人口データを駅乗降者数と掛け合わせた全国版の分析記事です。</p>
          <div className="articles-grid">
            <ArticleCard
              href="/population"
              title="人口分析ツール"
              description="都道府県・市区町村を選んで人口推移をグラフで確認できます。複数自治体の比較も可能。"
              linkLabel="人口分析を開く"
            />
            <ArticleCard
              href="/articles/population-passengers-cross-analysis"
              title="人口増加×駅乗降者数で見る成長エリアランキング"
              description="人口が増えていて、かつ駅利用も多いエリアをスコア化してTOP20を紹介。"
            />
            <ArticleCard
              href="/articles/population-growth-low-passenger-analysis"
              title="人口は増えているのに駅利用が弱い街ランキング"
              description="人口増加率と駅利用のギャップから、車社会・郊外住宅地型の成長エリアを可視化。"
            />
            <ArticleCard
              href="/articles/population-decline-high-passenger-analysis"
              title="人口は減っているのに人流が強い街ランキング"
              description="人口減少でも駅利用が活発な街を抽出。観光地・商業地・オフィス街の特徴を分析。"
            />
          </div>
        </section>

        {/* 都道府県別の人口ランキング */}
        <section style={{ marginBottom: '48px' }}>
          <h2 style={h2Style}>都道府県別の人口ランキング</h2>
          <p style={sectionDescStyle}>都道府県ごとに、人口が増えている自治体・減っている自治体をランキング形式で確認できます。全47都道府県対応。</p>
          <div className="articles-grid">
            <PrefGuideCard
              basePath="/population-ranking"
              title="都道府県別 人口増加自治体ランキング"
              description="県内で人口が増えている市区町村をランキング形式で確認できます。"
            />
            <PrefGuideCard
              basePath="/population-decline-ranking"
              title="都道府県別 人口減少自治体ランキング"
              description="県内で人口が減少している市区町村をランキング形式で確認できます。"
            />
          </div>
        </section>

        {/* 関連データを見る */}
        <section style={{ marginBottom: '48px' }}>
          <h2 style={h2Style}>関連データを見る</h2>
          <p style={sectionDescStyle}>人口分析に関連するテーマハブやデータページです。</p>
          <div className="articles-grid-3">
            <Link href="/articles/growth-areas" className="article-card" style={cardStyle}>
              <div style={{ fontSize: '15px', fontWeight: 700 }}>成長エリア分析</div>
              <div style={{ color: '#aaa', fontSize: '13px', lineHeight: 1.7 }}>人口×人流を掛け合わせた成長エリア分析の記事一覧です。</div>
              <div style={{ color: '#00d4aa', fontSize: '13px', marginTop: 'auto', paddingTop: '6px' }}>記事一覧を見る →</div>
            </Link>
            <Link href="/articles/passenger-analysis" className="article-card" style={cardStyle}>
              <div style={{ fontSize: '15px', fontWeight: 700 }}>駅乗降者数・人流分析</div>
              <div style={{ color: '#aaa', fontSize: '13px', lineHeight: 1.7 }}>駅の乗降者数データをもとにした人流分析の記事一覧です。</div>
              <div style={{ color: '#00d4aa', fontSize: '13px', marginTop: 'auto', paddingTop: '6px' }}>記事一覧を見る →</div>
            </Link>
            <Link href="/articles" className="article-card" style={cardStyle}>
              <div style={{ fontSize: '15px', fontWeight: 700 }}>全記事一覧</div>
              <div style={{ color: '#aaa', fontSize: '13px', lineHeight: 1.7 }}>AreaScopeの全記事をテーマ別に確認できます。</div>
              <div style={{ color: '#00d4aa', fontSize: '13px', marginTop: 'auto', paddingTop: '6px' }}>/articles →</div>
            </Link>
          </div>
        </section>

        {/* まとめ */}
        <section style={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: '12px', padding: '28px', marginBottom: '48px' }}>
          <h2 style={h2Style}>AreaScopeの人口分析とは</h2>
          <p style={{ color: '#aaa', fontSize: '14px', lineHeight: 1.8, marginBottom: '12px' }}>
            AreaScopeでは、総務省「国勢調査」の人口データをもとに、市区町村ごとの人口推移を可視化しています。人口が増えている自治体、減っている自治体を都道府県別にランキングし、エリアの変化を定量的に把握できます。
          </p>
          <p style={{ color: '#aaa', fontSize: '14px', lineHeight: 1.8, marginBottom: 0 }}>
            人口データは単体でも有用ですが、駅の乗降者数と組み合わせることで「人口が増えているのに駅利用が弱い街」「人口は減っているのに人流が強い街」など、単一指標では見えないエリアの実態が浮かび上がります。
          </p>
        </section>

        {/* フッター */}
        <div style={{ borderTop: '1px solid #1e2d45', paddingTop: '24px' }}>
          <p style={{ color: '#6b7a99', fontSize: '12px', marginBottom: '12px', fontFamily: 'monospace', letterSpacing: '2px' }}>// 関連ページ</p>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <Link href="/articles" style={{ color: '#00d4aa', textDecoration: 'none', fontSize: '13px' }}>記事一覧に戻る</Link>
            <Link href="/articles/growth-areas" style={{ color: '#00d4aa', textDecoration: 'none', fontSize: '13px' }}>成長エリア分析</Link>
            <Link href="/population" style={{ color: '#00d4aa', textDecoration: 'none', fontSize: '13px' }}>人口分析ツール</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
