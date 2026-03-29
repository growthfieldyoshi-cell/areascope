import type { Metadata } from 'next';
import Link from 'next/link';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export const metadata: Metadata = {
  title: 'AreaScope｜駅・エリアデータを可視化',
  description: '全国の駅乗降者数・市区町村人口推移を可視化。全国9,012駅・1,256市区町村の公式データを無料で閲覧できます。',
  alternates: {
    canonical: 'https://areascope.jp',
  },
};

export default async function Home() {
  const yearRows = await sql`SELECT MIN(year) AS min_year, MAX(year) AS max_year FROM station_passengers`;
  const minYear = yearRows[0]?.min_year ?? 2011;
  const maxYear = yearRows[0]?.max_year ?? 2021;

  return (
    <main style={{
      minHeight: '100vh',
      background: '#0a0e1a',
      color: '#e8edf5',
      fontFamily: "'Noto Sans JP', sans-serif",
      display: 'flex',
      flexDirection: 'column',
    }}>
      <style>{`
        .hero { padding: 60px 32px 40px; max-width: 1200px; margin: 0 auto; width: 100%; box-sizing: border-box; }
        .hero-title { font-size: 52px; font-weight: 800; line-height: 1.1; margin-bottom: 24px; }
        .hero-meta { display: flex; gap: 24px; flex-wrap: wrap; margin-bottom: 0; }
        .hero-meta-item { font-family: monospace; font-size: 12px; color: #6b7a99; }
        .hero-meta-item span { color: #00d4aa; font-weight: 700; }
        .nav-section { max-width: 1200px; margin: 0 auto; padding: 0 32px 60px; width: 100%; box-sizing: border-box; }
        .nav-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        .nav-card { background: #111827; border: 1px solid #1e2d45; border-radius: 12px; padding: 28px; text-decoration: none; color: #e8edf5; display: flex; flex-direction: column; gap: 10px; }
        .nav-card:hover { border-color: #00d4aa; }
        .nav-card-icon { font-size: 28px; }
        .nav-card-title { font-size: 18px; font-weight: 700; color: #00d4aa; }
        .nav-card-desc { font-size: 13px; color: #6b7a99; line-height: 1.7; }
        .nav-card-link { font-size: 12px; color: #00d4aa; font-family: monospace; margin-top: 4px; }
        .header-nav { display: flex; gap: 10px; flex-wrap: wrap; }
        @media (max-width: 768px) {
          .hero { padding: 40px 20px 32px; }
          .hero-title { font-size: 36px; }
          .nav-section { padding: 0 20px 40px; }
          .nav-grid { grid-template-columns: 1fr; }
          .header-nav { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; }
          .header-nav a { text-align: center; font-size: 11px !important; padding: 5px 8px !important; }
        }
      `}</style>

      <header style={{ padding: '16px 20px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', borderBottom: '1px solid #1e2d45', background: 'rgba(10,14,26,0.95)' }}>
        <div style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '0.05em', flexShrink: 0 }}>
          AREA<span style={{ color: '#00d4aa' }}>SCOPE</span>
        </div>
        <div className="header-nav">
          <Link href="/station-ranking" style={{ fontFamily: 'monospace', fontSize: '12px', color: '#6b7a99', background: '#111827', border: '1px solid #1e2d45', padding: '6px 12px', borderRadius: '6px', textDecoration: 'none' }}>🏆 駅ランキング</Link>
          <Link href="/station/list" style={{ fontFamily: 'monospace', fontSize: '12px', color: '#6b7a99', background: '#111827', border: '1px solid #1e2d45', padding: '6px 12px', borderRadius: '6px', textDecoration: 'none' }}>🚃 駅一覧</Link>
          <Link href="/city" style={{ fontFamily: 'monospace', fontSize: '12px', color: '#6b7a99', background: '#111827', border: '1px solid #1e2d45', padding: '6px 12px', borderRadius: '6px', textDecoration: 'none' }}>🏙️ 市区町村</Link>
          <Link href="/line" style={{ fontFamily: 'monospace', fontSize: '12px', color: '#6b7a99', background: '#111827', border: '1px solid #1e2d45', padding: '6px 12px', borderRadius: '6px', textDecoration: 'none' }}>🗺️ 路線</Link>
        </div>
      </header>

      <section className="hero">
        <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#00d4aa', letterSpacing: '3px', marginBottom: '16px' }}>
          // 駅・エリアデータ可視化
        </div>
        <h1 className="hero-title">
          日本全国の駅・<br />
          <span style={{ color: '#00d4aa' }}>エリアデータ</span>を可視化。
        </h1>
        <p style={{ fontSize: '15px', color: '#6b7a99', lineHeight: 1.8, marginBottom: '24px', maxWidth: '560px' }}>
          駅別乗降者数・市区町村人口推移を一目で確認。全国の公式データを無料で閲覧できます。
        </p>
        <div className="hero-meta">
          <div className="hero-meta-item">全国 <span>9,012</span> 駅</div>
          <div className="hero-meta-item"><span>1,256</span> 市区町村</div>
          <div className="hero-meta-item">時系列データ <span>{minYear}〜{maxYear}年</span></div>
        </div>
      </section>

      <div style={{ borderTop: '1px solid #1e2d45', paddingTop: '40px' }}>
        <div className="nav-section">
          <p style={{ fontSize: '12px', fontFamily: 'monospace', color: '#6b7a99', marginBottom: '20px', letterSpacing: '2px' }}>
            // 主要ページ
          </p>
          <div className="nav-grid">
            <Link href="/station" className="nav-card">
              <div className="nav-card-icon">🔍</div>
              <div className="nav-card-title">駅検索</div>
              <div className="nav-card-desc">駅名を入力して乗降者数データを検索。全国9,012駅の時系列データを確認できます。</div>
              <div className="nav-card-link">/station →</div>
            </Link>
            <Link href="/station-ranking" className="nav-card">
              <div className="nav-card-icon">🏆</div>
              <div className="nav-card-title">駅ランキング</div>
              <div className="nav-card-desc">全国の駅乗降者数ランキング。乗降者数順で主要駅を比較できます。</div>
              <div className="nav-card-link">/station-ranking →</div>
            </Link>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', gridColumn: '1 / -1' }}>
              <span style={{ fontSize: '11px', color: '#6b7a99', alignSelf: 'center' }}>都道府県別：</span>
              {[
                { slug: 'tokyo', name: '東京都' },
                { slug: 'kanagawa', name: '神奈川県' },
                { slug: 'osaka', name: '大阪府' },
                { slug: 'aichi', name: '愛知県' },
                { slug: 'fukuoka', name: '福岡県' },
                { slug: 'saitama', name: '埼玉県' },
                { slug: 'chiba', name: '千葉県' },
                { slug: 'hyogo', name: '兵庫県' },
              ].map((p) => (
                <Link key={p.slug} href={`/station-ranking/${p.slug}`} style={{ fontSize: '11px', color: '#00d4aa', background: '#111827', border: '1px solid #1e2d45', borderRadius: '4px', padding: '3px 8px', textDecoration: 'none' }}>
                  {p.name}
                </Link>
              ))}
              <Link href="/articles/prefecture-ranking" style={{ fontSize: '11px', color: '#6b7a99', alignSelf: 'center', textDecoration: 'none', marginLeft: '4px' }}>
                全47都道府県 →
              </Link>
            </div>
            <Link href="/line" className="nav-card">
              <div className="nav-card-icon">🗺️</div>
              <div className="nav-card-title">路線一覧</div>
              <div className="nav-card-desc">路線ごとの駅データ。山手線・中央線など主要路線の沿線データを掲載しています。</div>
              <div className="nav-card-link">/line →</div>
            </Link>
            <Link href="/population" className="nav-card">
              <div className="nav-card-icon">🏙️</div>
              <div className="nav-card-title">人口分析</div>
              <div className="nav-card-desc">市区町村人口推移を分析。都道府県・市区町村を選んで人口動態を確認できます。</div>
              <div className="nav-card-link">/population →</div>
            </Link>
          </div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid #1e2d45', paddingTop: '48px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 32px 60px' }}>
          <p style={{ fontSize: '12px', fontFamily: 'monospace', color: '#6b7a99', marginBottom: '20px', letterSpacing: '2px' }}>
            // AreaScopeについて
          </p>

          <div style={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: '12px', padding: '32px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#00d4aa', marginBottom: '16px' }}>AreaScopeとは</h2>
            <p style={{ color: '#aaa', fontSize: '14px', lineHeight: 1.8, marginBottom: '16px' }}>
              AreaScopeは、国土交通省・総務省の公式データをもとに、全国9,000超の駅の乗降者数と1,200超の市区町村の人口推移を可視化するデータサービスです。駅やエリアごとの利用状況・人口動態を、誰でも無料で確認できます。
            </p>
            <p style={{ color: '#aaa', fontSize: '14px', lineHeight: 1.8 }}>
              データは{minYear}年〜{maxYear}年の時系列で収録しており、コロナ前後の変化や長期トレンドの把握に活用できます。
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px' }}>
            <div style={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: '12px', padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#e8edf5', marginBottom: '12px' }}>引っ越し・住み替え検討に</h3>
              <p style={{ color: '#6b7a99', fontSize: '13px', lineHeight: 1.7 }}>
                最寄り駅の利用者数や周辺人口の増減を確認すれば、街の活気度や将来性の判断材料になります。通勤路線の混雑度も乗降者数から推定できます。
              </p>
            </div>
            <div style={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: '12px', padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#e8edf5', marginBottom: '12px' }}>エリア比較・出店検討に</h3>
              <p style={{ color: '#6b7a99', fontSize: '13px', lineHeight: 1.7 }}>
                複数駅の乗降者数を比較し、集客ポテンシャルを定量的に評価できます。人口推移と合わせて見ることで、エリアの成長性も判断可能です。
              </p>
            </div>
            <div style={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: '12px', padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#e8edf5', marginBottom: '12px' }}>路線・沿線分析に</h3>
              <p style={{ color: '#6b7a99', fontSize: '13px', lineHeight: 1.7 }}>
                路線単位で駅の乗降者数を一覧比較できます。ターミナル駅との距離感や、沿線全体の利用動向を把握するのに役立ちます。
              </p>
            </div>
            <div style={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: '12px', padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#e8edf5', marginBottom: '12px' }}>データの出典と信頼性</h3>
              <p style={{ color: '#6b7a99', fontSize: '13px', lineHeight: 1.7 }}>
                駅乗降者数は国土交通省「国土数値情報」、人口データは総務省「e-Stat」の公式統計を使用しています。推計値や独自集計ではなく、政府公開データに基づいています。
              </p>
            </div>
          </div>

          <div style={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: '12px', padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#e8edf5', marginBottom: '12px' }}>今後の展望</h3>
            <p style={{ color: '#6b7a99', fontSize: '13px', lineHeight: 1.7 }}>
              今後は不動産価格データとの連携、駅周辺の商業施設情報の追加、AIによるエリア将来予測など、データの幅と分析機能を拡充していく予定です。
            </p>
          </div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid #1e2d45', paddingTop: '48px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 32px 60px' }}>
          <p style={{ fontSize: '12px', fontFamily: 'monospace', color: '#6b7a99', marginBottom: '20px', letterSpacing: '2px' }}>
            // クイズで楽しく学ぶ
          </p>
          <p style={{ color: '#aaa', fontSize: '14px', lineHeight: 1.8, marginBottom: '20px' }}>
            駅名・地名・路線など、データをクイズ形式で楽しく学べます。
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link href="/quiz" style={{ color: '#e8edf5', textDecoration: 'none', background: '#111827', border: '1px solid #1e2d45', borderRadius: '8px', padding: '12px 20px', fontSize: '14px' }}>
              クイズ一覧を見る
            </Link>
            <Link href="/station/hard-reading" style={{ color: '#e8edf5', textDecoration: 'none', background: '#111827', border: '1px solid #1e2d45', borderRadius: '8px', padding: '12px 20px', fontSize: '14px' }}>
              難読駅名一覧を見る
            </Link>
            <Link href="/city/hard-reading" style={{ color: '#e8edf5', textDecoration: 'none', background: '#111827', border: '1px solid #1e2d45', borderRadius: '8px', padding: '12px 20px', fontSize: '14px' }}>
              難読市区町村名一覧を見る
            </Link>
          </div>
        </div>
      </div>

      <footer style={{ padding: '20px 32px', borderTop: '1px solid #1e2d45', fontFamily: 'monospace', fontSize: '11px', color: '#6b7a99', textAlign: 'center', marginTop: 'auto' }}>
        <div style={{ marginBottom: '10px' }}>出典: 国土交通省 国土数値情報 / 総務省統計局 e-Stat | © 2025 AREASCOPE</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <Link href="/about" style={{ color: '#00d4aa', textDecoration: 'none' }}>運営者情報</Link>
          <Link href="/privacy" style={{ color: '#00d4aa', textDecoration: 'none' }}>プライバシーポリシー</Link>
        </div>
      </footer>
    </main>
  );
}
