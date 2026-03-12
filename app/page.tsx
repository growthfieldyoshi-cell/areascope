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
      <header style={{
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #1e2d45',
        background: 'rgba(10,14,26,0.95)',
      }}>
        <div style={{fontSize: '22px', fontWeight: 800}}>
          AREA<span style={{color: '#00d4aa'}}>SCOPE</span>
        </div>
        <div style={{display: 'flex', gap: '10px'}}>
          <a href="/station" style={{fontFamily: 'monospace', fontSize: '12px', color: '#6b7a99', background: '#111827', border: '1px solid #1e2d45', padding: '6px 12px', borderRadius: '6px', textDecoration: 'none'}}>🚃 乗降客数</a>
          <a href="/population" style={{fontFamily: 'monospace', fontSize: '12px', color: '#6b7a99', background: '#111827', border: '1px solid #1e2d45', padding: '6px 12px', borderRadius: '6px', textDecoration: 'none'}}>👥 人口推移</a>
        </div>
      </header>

      <section style={{flex: 1, display: 'flex', alignItems: 'center', padding: '80px 32px', maxWidth: '1200px', margin: '0 auto', width: '100%', gap: '60px'}}>
        <div style={{flex: 1}}>
          <div style={{fontFamily: 'monospace', fontSize: '11px', color: '#00d4aa', letterSpacing: '3px', marginBottom: '16px'}}>
            // 不動産投資家向けエリア分析
          </div>
          <h1 style={{fontSize: '52px', fontWeight: 800, lineHeight: 1.1, marginBottom: '24px'}}>
            データで選ぶ、<br />
            <span style={{color: '#00d4aa'}}>投資エリア</span>。
          </h1>
          <p style={{fontSize: '16px', color: '#6b7a99', lineHeight: 1.8, marginBottom: '36px', maxWidth: '480px'}}>
            駅別乗降客数・市区町村人口推移を一目で可視化。全国8,124駅・1,741市区町村の公式データを無料で閲覧できます。
          </p>
          <div style={{display: 'flex', gap: '12px', flexWrap: 'wrap'}}>
            <a href="/station" style={{background: '#00d4aa', color: '#0a0e1a', padding: '14px 28px', borderRadius: '8px', fontWeight: 700, fontSize: '15px', textDecoration: 'none'}}>🚃 駅別乗降客数を見る</a>
            <a href="/population" style={{background: 'transparent', color: '#e8edf5', padding: '14px 28px', borderRadius: '8px', fontWeight: 600, fontSize: '15px', textDecoration: 'none', border: '1px solid #1e2d45'}}>👥 人口推移を見る</a>
          </div>
        </div>

        <div style={{display: 'flex', flexDirection: 'column', gap: '16px', minWidth: '280px'}}>
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

      <footer style={{padding: '20px 32px', borderTop: '1px solid #1e2d45', fontFamily: 'monospace', fontSize: '11px', color: '#6b7a99', textAlign: 'center'}}>
        出典: 国土交通省 国土数値情報 / 総務省統計局 e-Stat | © 2025 AREASCOPE
      </footer>
    </main>
  );
}