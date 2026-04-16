import Link from 'next/link';
import type { Metadata } from 'next';
import Breadcrumb from '@/components/Breadcrumb';

export const metadata: Metadata = {
  title: '駅乗降者数・人流分析の記事一覧｜ランキング・推移データ',
  description: 'AreaScopeの駅乗降者数・人流分析の記事一覧です。全国駅ランキング、回復率分析、都道府県別人流ランキングなど、駅データをもとにした分析コンテンツをまとめています。',
  alternates: {
    canonical: 'https://areascope.jp/articles/passenger-analysis',
  },
  openGraph: {
    type: 'website',
    title: '駅乗降者数・人流分析の記事一覧｜ランキング・推移データ',
    description: 'AreaScopeの駅乗降者数・人流分析の記事一覧です。全国駅ランキング、回復率分析、都道府県別人流ランキングなど、駅データをもとにした分析コンテンツをまとめています。',
    url: 'https://areascope.jp/articles/passenger-analysis',
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

export default function PassengerAnalysisHubPage() {
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
        <Breadcrumb items={[
          { label: 'TOP', href: '/' },
          { label: '記事一覧', href: '/articles' },
          { label: '駅乗降者数・人流分析の記事一覧' },
        ]} />
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '12px' }}>
          駅乗降者数・<span style={{ color: '#00d4aa' }}>人流分析</span>の記事一覧
        </h1>
        <p style={{ color: '#aaa', fontSize: '14px', lineHeight: 1.8, marginBottom: '40px' }}>
          駅の乗降者数データをもとに、人流の変化やコロナ前後の回復状況を分析する記事をまとめています。全国版のランキング・分析記事と、都道府県別の人流ランキングページへの入口を掲載しています。
        </p>

        {/* 全国版の人流分析 */}
        <section style={{ marginBottom: '48px' }}>
          <h2 style={h2Style}>全国版の人流分析</h2>
          <p style={sectionDescStyle}>全国の駅乗降者数データを使った分析記事とランキングページです。</p>
          <div className="articles-grid">
            <ArticleCard
              href="/articles/station-passenger-recovery-analysis"
              title="駅乗降者数の回復率ランキング（コロナ前後）"
              description="2019年と最新年の乗降者数を比較し、回復率が高い駅をランキング形式で紹介。観光地・商業地・オフィス街で回復速度が異なる実態を分析。"
            />
            <ArticleCard
              href="/articles/station-passengers-growth-2023"
              title="2023年に乗降者数が最も増えた駅ランキング"
              description="2022年から2023年にかけて乗降者数が最も増加した駅TOP20をデータで紹介。"
            />
            <ArticleCard
              href="/station-ranking"
              title="全国駅ランキング"
              description="全国の駅を乗降者数順にランキング。都道府県フィルタで県別の比較も可能です。"
              linkLabel="ランキングを見る"
            />
          </div>
        </section>

        {/* 主要路線の駅乗降者数ランキング */}
        <section style={{ marginBottom: '48px' }}>
          <h2 style={h2Style}>主要路線の駅乗降者数ランキング</h2>
          <p style={sectionDescStyle}>路線ごとに利用者が多い駅をランキング形式で確認できます。路線内の人の流れや中心駅を把握するのに役立ちます。今後も主要路線を追加していく予定です。</p>
          <div className="articles-grid">
            <ArticleCard
              href="/articles/line-passenger-ranking/yamanote"
              title="山手線の駅乗降者数ランキング"
              description="山手線の中で利用者数が多い駅をランキング形式で掲載。都心部の人流が集中する駅を確認できます。"
            />
            <ArticleCard
              href="/articles/line-passenger-ranking/inokashira"
              title="京王井の頭線の駅乗降者数ランキング"
              description="京王井の頭線の中で利用者数が多い駅をランキング形式で掲載。沿線内で人の流れが集まる駅を確認できます。"
            />
          </div>
        </section>

        {/* 都道府県別の人流ランキング */}
        <section style={{ marginBottom: '48px' }}>
          <h2 style={h2Style}>都道府県別の人流ランキング</h2>
          <p style={sectionDescStyle}>全国版の分析を都道府県別に展開したページです。各テーマで全47都道府県分のページがあります。</p>
          <div className="articles-grid">
            <PrefGuideCard
              basePath="/articles/station-passenger-recovery"
              title="都道府県別 駅回復率ランキング"
              description="県内の駅ごとにコロナ前後の回復率を比較できます。全47都道府県対応。"
            />
            <div style={{ ...cardStyle, textDecoration: 'none' }}>
              <div style={{ fontSize: '15px', fontWeight: 700, lineHeight: 1.5 }}>都道府県別 駅乗降者数ランキング記事</div>
              <div style={{ color: '#aaa', fontSize: '13px', lineHeight: 1.7 }}>47都道府県の駅乗降者数ランキングを、データの読み方とあわせて解説する記事です。</div>
              <div style={{ marginTop: '8px' }}>
                <Link href="/articles/prefecture-ranking" style={{ fontSize: '13px', color: '#00d4aa', textDecoration: 'none', fontWeight: 600 }}>
                  都道府県別ランキング一覧を見る →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 関連データを見る */}
        <section style={{ marginBottom: '48px' }}>
          <h2 style={h2Style}>関連データを見る</h2>
          <p style={sectionDescStyle}>人流分析に関連するデータページやテーマハブです。</p>
          <div className="articles-grid-3">
            <Link href="/population" className="article-card" style={cardStyle}>
              <div style={{ fontSize: '15px', fontWeight: 700 }}>人口分析</div>
              <div style={{ color: '#aaa', fontSize: '13px', lineHeight: 1.7 }}>市区町村の人口推移をグラフで確認できます。</div>
              <div style={{ color: '#00d4aa', fontSize: '13px', marginTop: 'auto', paddingTop: '6px' }}>/population →</div>
            </Link>
            <Link href="/articles/growth-areas" className="article-card" style={cardStyle}>
              <div style={{ fontSize: '15px', fontWeight: 700 }}>成長エリア分析</div>
              <div style={{ color: '#aaa', fontSize: '13px', lineHeight: 1.7 }}>人口×人流を掛け合わせた成長エリア分析の記事一覧です。</div>
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
          <h2 style={h2Style}>AreaScopeの人流分析とは</h2>
          <p style={{ color: '#aaa', fontSize: '14px', lineHeight: 1.8, marginBottom: '12px' }}>
            AreaScopeでは、国土交通省「国土数値情報」の駅乗降者数データをもとに、駅ごとの利用状況や人流の変化を可視化しています。コロナ前後の回復率、年ごとの増減、都道府県別の比較など、駅データの多角的な読み解き方を提供します。
          </p>
          <p style={{ color: '#aaa', fontSize: '14px', lineHeight: 1.8, marginBottom: 0 }}>
            乗降者数は、エリアの集客力・通勤需要・商圏の強さを測る基本指標です。人口データと合わせて確認することで、より正確なエリア分析が可能になります。
          </p>
        </section>

        {/* フッター */}
        <div style={{ borderTop: '1px solid #1e2d45', paddingTop: '24px' }}>
          <p style={{ color: '#6b7a99', fontSize: '12px', marginBottom: '12px', fontFamily: 'monospace', letterSpacing: '2px' }}>// 関連ページ</p>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <Link href="/articles" style={{ color: '#00d4aa', textDecoration: 'none', fontSize: '13px' }}>記事一覧に戻る</Link>
            <Link href="/articles/growth-areas" style={{ color: '#00d4aa', textDecoration: 'none', fontSize: '13px' }}>成長エリア分析</Link>
            <Link href="/station-ranking" style={{ color: '#00d4aa', textDecoration: 'none', fontSize: '13px' }}>全国駅ランキング</Link>
            <Link href="/city" style={{ color: '#00d4aa', textDecoration: 'none', fontSize: '13px' }}>市区町村一覧を見る</Link>
            <Link href="/population-ranking" style={{ color: '#00d4aa', textDecoration: 'none', fontSize: '13px' }}>人口増加ランキングを見る</Link>
            <Link href="/prefecture" style={{ color: '#00d4aa', textDecoration: 'none', fontSize: '13px' }}>都道府県別のエリア分析を見る</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
