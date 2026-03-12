'use client';
import { useState } from 'react';

type Station = {
  id: number;
  station_name: string;
  line_name: string;
  prefecture: string;
  passengers_2011: number;
  passengers_2012: number;
  passengers_2013: number;
  passengers_2014: number;
  passengers_2015: number;
  passengers_2016: number;
  passengers_2017: number;
  passengers_2018: number;
  passengers_2019: number;
  passengers_2020: number;
  passengers_2021: number;
};

const YEARS = [2011,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021];

export default function StationPage() {
  const [query, setQuery] = useState('');
  const [stations, setStations] = useState<Station[]>([]);
  const [selected, setSelected] = useState<Station | null>(null);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    if (!query) return;
    setLoading(true);
    const res = await fetch(`/api/stations?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    setStations(data.stations);
    setSelected(null);
    setLoading(false);
  };

  const getPassengers = (s: Station) => YEARS.map(y => (s as any)[`passengers_${y}`] || 0);
  const maxVal = selected ? Math.max(...getPassengers(selected)) : 1;

  return (
    <main style={{minHeight: '100vh', background: '#0a0e1a', color: '#e8edf5', fontFamily: "'Noto Sans JP', sans-serif", display: 'flex', flexDirection: 'column'}}>
      <style>{`
        .search-input:focus { outline: none; border-color: #00d4aa; }
        .station-item:hover { background: #1a2540; cursor: pointer; }
        .bar-wrap { display: flex; flex-direction: column; gap: 8px; }
        .bar-row { display: flex; align-items: center; gap: 8px; }
        .bar-label { font-family: monospace; font-size: 11px; color: #6b7a99; width: 36px; text-align: right; }
        .bar-bg { flex: 1; background: #1e2d45; border-radius: 4px; height: 24px; }
        .bar-fill { background: #00d4aa; border-radius: 4px; height: 24px; display: flex; align-items: center; padding-left: 8px; font-size: 11px; font-family: monospace; color: #0a0e1a; font-weight: 700; transition: width 0.3s; }
        @media (max-width: 768px) {
          .content { padding: 20px 16px !important; }
          .results { flex-direction: column !important; }
        }
      `}</style>

      <header style={{padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1e2d45', background: 'rgba(10,14,26,0.95)'}}>
        <a href="/" style={{fontSize: '22px', fontWeight: 800, textDecoration: 'none', color: '#e8edf5'}}>
          AREA<span style={{color: '#00d4aa'}}>SCOPE</span>
        </a>
        <a href="/population" style={{fontFamily: 'monospace', fontSize: '12px', color: '#6b7a99', background: '#111827', border: '1px solid #1e2d45', padding: '6px 12px', borderRadius: '6px', textDecoration: 'none'}}>👥 人口推移</a>
      </header>

      <section className="content" style={{flex: 1, padding: '40px 32px', maxWidth: '900px', margin: '0 auto', width: '100%', boxSizing: 'border-box'}}>
        <div style={{fontFamily: 'monospace', fontSize: '11px', color: '#00d4aa', letterSpacing: '3px', marginBottom: '12px'}}>// 駅別乗降客数</div>
        <h1 style={{fontSize: '32px', fontWeight: 800, marginBottom: '32px'}}>駅別乗降客数<span style={{color: '#00d4aa'}}>データ</span></h1>

        <div style={{display: 'flex', gap: '12px', marginBottom: '32px'}}>
          <input
            className="search-input"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()}
            placeholder="駅名を入力（例：渋谷、新宿）"
            style={{flex: 1, background: '#111827', border: '1px solid #1e2d45', borderRadius: '8px', padding: '12px 16px', color: '#e8edf5', fontSize: '15px'}}
          />
          <button onClick={search} style={{background: '#00d4aa', color: '#0a0e1a', border: 'none', borderRadius: '8px', padding: '12px 24px', fontWeight: 700, fontSize: '15px', cursor: 'pointer'}}>
            {loading ? '検索中...' : '検索'}
          </button>
        </div>

        <div className="results" style={{display: 'flex', gap: '24px'}}>
          {stations.length > 0 && (
            <div style={{minWidth: '220px'}}>
              <div style={{fontFamily: 'monospace', fontSize: '11px', color: '#6b7a99', marginBottom: '8px'}}>{stations.length}件ヒット</div>
              {stations.map(s => (
                <div key={s.id} className="station-item" onClick={() => setSelected(s)}
                  style={{padding: '12px 16px', borderRadius: '8px', marginBottom: '8px', background: selected?.id === s.id ? '#1a2540' : '#111827', border: `1px solid ${selected?.id === s.id ? '#00d4aa' : '#1e2d45'}`}}>
                  <div style={{fontWeight: 700}}>{s.station_name}</div>
                  <div style={{fontSize: '12px', color: '#6b7a99', marginTop: '4px'}}>{s.line_name} / {s.prefecture}</div>
                </div>
              ))}
            </div>
          )}

          {selected && (
            <div style={{flex: 1}}>
              <div style={{marginBottom: '24px'}}>
                <div style={{fontSize: '22px', fontWeight: 800}}>{selected.station_name}駅</div>
                <div style={{fontSize: '13px', color: '#6b7a99', marginTop: '4px'}}>{selected.line_name} / {selected.prefecture}</div>
              </div>
              <div className="bar-wrap">
                {YEARS.map(y => {
                  const val = (selected as any)[`passengers_${y}`] || 0;
                  const pct = maxVal > 0 ? (val / maxVal) * 100 : 0;
                  return (
                    <div key={y} className="bar-row">
                      <div className="bar-label">{y}</div>
                      <div className="bar-bg">
                        <div className="bar-fill" style={{width: `${pct}%`}}>
                          {val > 0 ? val.toLocaleString() : '－'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {stations.length === 0 && !loading && (
          <div style={{textAlign: 'center', color: '#6b7a99', marginTop: '60px'}}>
            <div style={{fontSize: '40px', marginBottom: '16px'}}>🚃</div>
            <div>駅名を入力して検索してください</div>
          </div>
        )}
      </section>

      <footer style={{padding: '20px 32px', borderTop: '1px solid #1e2d45', fontFamily: 'monospace', fontSize: '11px', color: '#6b7a99', textAlign: 'center'}}>
        出典: 国土交通省 国土数値情報 | © 2025 AREASCOPE
      </footer>
    </main>
  );
}