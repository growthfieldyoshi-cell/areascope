import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://areascope.jp',
  },
};

export default function Home() {
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
        @media (max-width: 768px) {
          .hero { padding: 40px 20px 32px; }
          .hero-title { font-size: 36px; }
          .nav-section { padding: 0 20px 40px; }
          .nav-grid { grid-template-columns: 1fr; }
          .nav-links a { padding: 5px 10px !important; font-size: 11px !important; }
        }
      `}</style>

      <header style={{ padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1e2d45', background: 'rgba(10,14,26,0.95)' }}>
        <div style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '0.05em' }}>
          AREA<span style={{ color: '#00d4aa' }}>SCOPE</span>
        </div>
        <div className="nav-links" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Link href="/station-ranking" style={{ fontFamily: 'monospace', fontSize: '12px', color: '#6b7a99', background: '#111827', border: '1px solid #1e2d45', padding: '6px 12px', borderRadius: '6px', textDecoration: 'none' }}>🏆 駅ランキング</Link>
          <Link href="/station/list" style={{ fontFamily: 'monospace', fontSize: '12px', color: '#6b7a99', background: '#111827', border: '1px solid #1e2d45', padding: '6px 12px', borderRadius: '6px', textDecoration: 'none' }}>🚃 駅一覧</Link>
          <Link href="/city" style={{ fontFamily: 'monospace', fontSize: '12px', color: '#6b7a99', background: '#111827', border: '1px solid #1e2d45', padding: '6px 12px', borderRadius: '6px', textDecoration: 'none' }}>🏙️ 市区町村</Link>
          <Link href="/line" style={{ fontFamily: 'monospace', fontSize: '12px', color: '#6b7a99', background: '#111827', border: '1px solid #1e2d45', padding: '6px 12px', borderRadius: '6px', textDecoration: 'none' }}>🗺️ 路線</Link>
        </div>
      </header>

      <section className="hero">
        <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#00d4aa', letterSpacing: '3px', marginBottom: '16px' }}>
          // 不動産投資家向けエリア分析
        </div>
        <h1 className="hero-title">
          データで選ぶ、<br />
          <span style={{ color: '#00d4aa' }}>投資エリア</span>。
        </h1>
        <p style={{ fontSize: '15px', color: '#6b7a99', lineHeight: 1.8, marginBottom: '24px', maxWidth: '560px' }}>
          駅別乗降者数・市区町村人口推移を一目で可視化。公式データを無料で閲覧できます。
        </p>
        <div className="hero-meta">
          <div className="hero-meta-item">全国 <span>9,012</span> 駅</div>
          <div className="hero-meta-item"><span>1,256</span> 市区町村</div>
          <div className="hero-meta-item">時系列データ <span>2011〜2021年</span></div>
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