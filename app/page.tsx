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
        .hero { display: flex; align-items: center; padding: 60px 32px; max-width: 1200px; margin: 0 auto; width: 100%; gap: 60px; box-sizing: border-box; }
        .hero-left { flex: 1; }
        .hero-right { display: flex; flex-direction: column; gap: 16px; min-width: 280px; }
        .hero-title { font-size: 52px; font-weight: 800; line-height: 1.1; margin-bottom: 24px; }
        .btn-primary { background: #00d4aa; color: #0a0e1a; padding: 14px 28px; border-radius: 8px; font-weight: 700; font-size: 15px; text-decoration: none; display: inline-block; }
        .btn-secondary { background: transparent; color: #e8edf5; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 15px; text-decoration: none; border: 1px solid #1e2d45; display: inline-block; }
        .btn-wrap { display: flex; gap: 12px; flex-wrap: wrap; }
        @media (max-width: 768px) {
          .hero { flex-direction: column; padding: 40px 20px; gap: 32px; }
          .hero-right { min-width: unset; width: 100%; flex-direction: row; flex-wrap: wrap; }
          .hero-right > div { flex: 1; min-width: 140px; }
          .hero-title { font-size: 36px; }
          .btn-primary, .btn-secondary { padding: 12px 20px; font-size: 14px; }
          .nav-links a { padding: 5px 10px !important; font-size: 11px !important; }
        }
      `}</style>

      <header style={{padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1e2d45', background: 'rgba(10,14,26,0.95)'}}>
        <div style={{fontSize: '22px', fontWeight: 800, letterSpacing: '0.05em'}}>
          AREA<span style={{color: '#00d4aa'}}>SCOPE</span>
        </div>
        <div className="nav-links" style={{display: 'flex', gap: '10px'}}>
          <a href="/station" style={{fontFamily: 'monospace', fontSize: '12px', color: '#6b7a99', background: '#111827', border: '1px solid #1e2d45', padding: '6px 12px', borderRadius: '6px', textDecoration: 'none'}}>🚃 乗降客数</a>
          <a href="/population" style={{fontFamily: 'monospace', fontSize: '12px', color: '#6b7a99', background: '#111827', border: '1px solid #1e2d45', padding: '6px 12px', borderRadius: '6px', textDecoration: 'none'}}>👥 人口推移</a>
        </div>
      </header>

      <section className="hero">
        <div className="hero-left">
          <div style={{fontFamily: 'monospace', fontSize: '11px', color: '#00d4aa', letterSpacing: '3px', marginBottom: '16px'}}>
            // 不動産投資家向けエリア分析
          </div>
          <h1 className="hero-title">
            データで選ぶ、<br />
            <span style={{color: '#00d4aa'}}>投資エリア</span>。
          </h1>
          <p style={{fontSize: '16px', color: '#6b7a99', lineHeight: 1.8, marginBottom: '36px', maxWidth: '480px'}}>
            駅別乗降客数・市区町村人口推移を一目で可視化。全国8,124駅・1,741市区町村の公式データを無料で閲覧できます。
          </p>
          <div className="btn-wrap">
            <a href="/station" className="btn-primary">🚃 駅別乗降客数を見る</a>
            <a href="/population" className="btn-secondary">👥 人口推移を見る</a>
          </div>
        </div>

        <div className="hero-right">
          {[
            {num: '8,124', label: '駅のデータ', sub: '全国47都道府県'},
            {num: '1,741', label: '市区町村', sub: '人口推移データ'},
            {num: '11年分', label: '時系列データ', sub: '2011〜2021年'},
          ].map((s, i) => (
            <div key={i} style={{background: '#111827', border: '1px solid #1e2d45', borderRadius: '12px', padding: '20px 24px'}}>
              <div style={{fontSize: '32px', fontWeight: 800, fontFamily: 'monospace', color: '#00d4aa'}}>{s.num}</div>
              <div style={{fontSize: '14px', fontWeight: 600, marginTop: '4px'}}>{s.label}</div>
              <div style={{fontSize: '12px', color: '#6b7a99', marginTop: '2px'}}>{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      <footer style={{padding: '20px 32px', borderTop: '1px solid #1e2d45', fontFamily: 'monospace', fontSize: '11px', color: '#6b7a99', textAlign: 'center', marginTop: 'auto'}}>
        出典: 国土交通省 国土数値情報 / 総務省統計局 e-Stat | © 2025 AREASCOPE
      </footer>
    </main>
  );
}