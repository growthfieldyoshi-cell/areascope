export default function StationPage() {
  return (
    <main style={{
      minHeight: '100vh',
      background: '#0a0e1a',
      color: '#e8edf5',
      fontFamily: "'Noto Sans JP', sans-serif",
      display: 'flex',
      flexDirection: 'column',
    }}>
      <header style={{padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1e2d45', background: 'rgba(10,14,26,0.95)'}}>
        <a href="/" style={{fontSize: '22px', fontWeight: 800, textDecoration: 'none', color: '#e8edf5'}}>
          AREA<span style={{color: '#00d4aa'}}>SCOPE</span>
        </a>
        <a href="/population" style={{fontFamily: 'monospace', fontSize: '12px', color: '#6b7a99', background: '#111827', border: '1px solid #1e2d45', padding: '6px 12px', borderRadius: '6px', textDecoration: 'none'}}>👥 人口推移</a>
      </header>

      <section style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '24px', padding: '60px 32px'}}>
        <div style={{fontFamily: 'monospace', fontSize: '11px', color: '#00d4aa', letterSpacing: '3px'}}>
          // 駅別乗降客数
        </div>
        <h1 style={{fontSize: '40px', fontWeight: 800, textAlign: 'center'}}>
          駅別乗降客数<span style={{color: '#00d4aa'}}>データ</span>
        </h1>
        <p style={{color: '#6b7a99', fontSize: '16px', textAlign: 'center', lineHeight: 1.8}}>
          全国8,124駅・2011〜2021年の乗降客数データ<br />
          準備中です。もうしばらくお待ちください。
        </p>
        <a href="/station.html" style={{background: '#00d4aa', color: '#0a0e1a', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: 700}}>
          → 今すぐデータを見る
        </a>
        <a href="/" style={{background: '#111827', border: '1px solid #1e2d45', color: '#e8edf5', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: 600}}>
          ← トップに戻る
        </a>
      </section>

      <footer style={{padding: '20px 32px', borderTop: '1px solid #1e2d45', fontFamily: 'monospace', fontSize: '11px', color: '#6b7a99', textAlign: 'center'}}>
        出典: 国土交通省 国土数値情報 / 総務省統計局 e-Stat | © 2025 AREASCOPE
      </footer>
    </main>
  );
}