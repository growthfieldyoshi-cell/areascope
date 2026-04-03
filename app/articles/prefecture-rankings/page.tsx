import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '都道府県別ランキングの記事一覧｜AreaScope',
  description: 'AreaScopeの都道府県別ランキング記事一覧です。県別の駅ランキング、駅回復率、人口増減自治体、成長エリア分析などをまとめています。',
  alternates: {
    canonical: 'https://areascope.jp/articles/prefecture-rankings',
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

export default function PrefectureRankingsHubPage() {
  return (
    <main style={{ background: '#0a0e1a', minHeight: '100vh', color: '#e8edf5', fontFamily: 'sans-serif' }}>
      <style>{`
        .articles-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        .articles-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .article-card:hover { border-color: #00d4aa !important; }
        @media (max-width: 768px) {
          .articles-grid { grid-template-columns: 1fr; }
          .articles-grid-4 { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 20px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '12px' }}>
          <span style={{ color: '#00d4aa' }}>都道府県別ランキング</span>の記事一覧
        </h1>
        <p style={{ color: '#aaa', fontSize: '14px', lineHeight: 1.8, marginBottom: '40px' }}>
          AreaScopeでは、駅乗降者数・人口推移・成長エリア分析を都道府県単位で確認できます。全国版の分析を県別に展開した各種ランキングページへの入口をまとめています。
        </p>

        {/* 都道府県別の駅ランキング */}
        <section style={{ marginBottom: '48px' }}>
          <h2 style={h2Style}>都道府県別の駅ランキング</h2>
          <p style={sectionDescStyle}>47都道府県の駅乗降者数ランキングを、データの読み方とあわせて解説する記事です。</p>
          <div style={{ background: '#111827', border: '1px solid #00d4aa', borderRadius: '12px', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#e8edf5', marginBottom: '4px' }}>全国47都道府県の駅乗降者数ランキング</div>
              <div style={{ color: '#6b7a99', fontSize: '13px' }}>都道府県別にまとめた駅乗降者数ランキングを地方ごとに確認できます。</div>
            </div>
            <Link href="/articles/prefecture-ranking" style={{ display: 'inline-block', color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '6px', padding: '8px 16px', textDecoration: 'none', fontSize: '13px', fontWeight: 700, flexShrink: 0 }}>
              都道府県別ランキング一覧 →
            </Link>
          </div>
        </section>

        {/* 都道府県別の人流分析 */}
        <section style={{ marginBottom: '48px' }}>
          <h2 style={h2Style}>都道府県別の人流分析</h2>
          <p style={sectionDescStyle}>県内の駅ごとにコロナ前後の乗降者数回復率を比較できるランキングページです。全47都道府県対応。</p>
          <PrefGuideCard
            basePath="/articles/station-passenger-recovery"
            title="都道府県別 駅回復率ランキング"
            description="県内の駅ごとに2019年と最新年の乗降者数を比較し、回復率が高い駅をランキングで確認できます。"
          />
        </section>

        {/* 都道府県別の人口分析 */}
        <section style={{ marginBottom: '48px' }}>
          <h2 style={h2Style}>都道府県別の人口分析</h2>
          <p style={sectionDescStyle}>県内の市区町村を人口増加率で比較できるランキングページです。増加自治体と減少自治体の両方を確認できます。</p>
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

        {/* 都道府県別の成長エリア分析 */}
        <section style={{ marginBottom: '48px' }}>
          <h2 style={h2Style}>都道府県別の成長エリア分析</h2>
          <p style={sectionDescStyle}>人口増加率と駅乗降者数を掛け合わせた県別の成長エリアランキングです。人口増×人流増と人口減×人流強の両面から分析できます。</p>
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
          <p style={sectionDescStyle}>テーマ別のハブページや全記事一覧です。</p>
          <div className="articles-grid-4">
            <Link href="/articles/population-analysis" className="article-card" style={cardStyle}>
              <div style={{ fontSize: '14px', fontWeight: 700 }}>人口分析</div>
              <div style={{ color: '#aaa', fontSize: '12px', lineHeight: 1.6 }}>人口系記事の一覧</div>
              <div style={{ color: '#00d4aa', fontSize: '12px', marginTop: 'auto', paddingTop: '4px' }}>→</div>
            </Link>
            <Link href="/articles/passenger-analysis" className="article-card" style={cardStyle}>
              <div style={{ fontSize: '14px', fontWeight: 700 }}>人流分析</div>
              <div style={{ color: '#aaa', fontSize: '12px', lineHeight: 1.6 }}>駅データ系記事の一覧</div>
              <div style={{ color: '#00d4aa', fontSize: '12px', marginTop: 'auto', paddingTop: '4px' }}>→</div>
            </Link>
            <Link href="/articles/growth-areas" className="article-card" style={cardStyle}>
              <div style={{ fontSize: '14px', fontWeight: 700 }}>成長エリア分析</div>
              <div style={{ color: '#aaa', fontSize: '12px', lineHeight: 1.6 }}>人口×人流の記事一覧</div>
              <div style={{ color: '#00d4aa', fontSize: '12px', marginTop: 'auto', paddingTop: '4px' }}>→</div>
            </Link>
            <Link href="/articles" className="article-card" style={cardStyle}>
              <div style={{ fontSize: '14px', fontWeight: 700 }}>全記事一覧</div>
              <div style={{ color: '#aaa', fontSize: '12px', lineHeight: 1.6 }}>すべての記事を確認</div>
              <div style={{ color: '#00d4aa', fontSize: '12px', marginTop: 'auto', paddingTop: '4px' }}>→</div>
            </Link>
          </div>
        </section>

        {/* まとめ */}
        <section style={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: '12px', padding: '28px', marginBottom: '48px' }}>
          <h2 style={h2Style}>都道府県単位で比較できるAreaScope</h2>
          <p style={{ color: '#aaa', fontSize: '14px', lineHeight: 1.8, marginBottom: '12px' }}>
            AreaScopeでは、駅乗降者数・人口推移・成長エリアスコアを都道府県単位で比較できます。全国版のランキングだけでは見えない、県内での駅ごと・自治体ごとの違いを把握するのに活用できます。
          </p>
          <p style={{ color: '#aaa', fontSize: '14px', lineHeight: 1.8, marginBottom: 0 }}>
            引越し先の検討、不動産投資の判断、商圏分析など、特定の都道府県に絞ったエリア選定にご活用ください。
          </p>
        </section>

        {/* フッター */}
        <div style={{ borderTop: '1px solid #1e2d45', paddingTop: '24px' }}>
          <p style={{ color: '#6b7a99', fontSize: '12px', marginBottom: '12px', fontFamily: 'monospace', letterSpacing: '2px' }}>// 関連ページ</p>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <Link href="/articles" style={{ color: '#00d4aa', textDecoration: 'none', fontSize: '13px' }}>記事一覧に戻る</Link>
            <Link href="/articles/prefecture-ranking" style={{ color: '#00d4aa', textDecoration: 'none', fontSize: '13px' }}>都道府県別駅ランキング一覧</Link>
            <Link href="/station-ranking" style={{ color: '#00d4aa', textDecoration: 'none', fontSize: '13px' }}>全国駅ランキング</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
