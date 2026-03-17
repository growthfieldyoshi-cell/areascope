'use client';
import { useState } from 'react';
import Link from 'next/link';

type Station = {
  slug: string;
  station_name: string;
  line_name: string;
  prefecture_name: string;
  station_group_slug: string;
};

export default function StationSearchClient() {
  const [query, setQuery] = useState('');
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    if (!query) return;
    setLoading(true);
    const res = await fetch(`/api/stations?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    setStations(data.stations ?? []);
    setLoading(false);
  };

  return (
    <main style={{ minHeight: '100vh', background: '#0a0e1a', color: '#e8edf5', fontFamily: "'Noto Sans JP', sans-serif", display: 'flex', flexDirection: 'column' }}>
      <style>{`
        .search-input:focus { outline: none; border-color: #00d4aa; }
        .station-item { padding: 14px 16px; border-radius: 8px; margin-bottom: 8px; background: #111827; border: 1px solid #1e2d45; cursor: pointer; text-decoration: none; display: block; color: #e8edf5; }
        .station-item:hover { border-color: #00d4aa; }
        @media (max-width: 640px) {
          .content { padding: 24px 16px !important; }
        }
      `}</style>

      <header style={{ padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1e2d45', background: 'rgba(10,14,26,0.95)' }}>
        <a href="/" style={{ fontSize: '22px', fontWeight: 800, textDecoration: 'none', color: '#e8edf5' }}>
          AREA<span style={{ color: '#00d4aa' }}>SCOPE</span>
        </a>
        <div style={{ display: 'flex', gap: '10px' }}>
          <a href="/station/list" style={{ fontFamily: 'monospace', fontSize: '12px', color: '#6b7a99', background: '#111827', border: '1px solid #1e2d45', padding: '6px 12px', borderRadius: '6px', textDecoration: 'none' }}>🚃 駅一覧</a>
          <a href="/line" style={{ fontFamily: 'monospace', fontSize: '12px', color: '#6b7a99', background: '#111827', border: '1px solid #1e2d45', padding: '6px 12px', borderRadius: '6px', textDecoration: 'none' }}>🗺️ 路線</a>
        </div>
      </header>

      <section className="content" style={{ flex: 1, padding: '40px 32px', maxWidth: '760px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#00d4aa', letterSpacing: '3px', marginBottom: '12px' }}>// 駅検索</div>
        <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '8px' }}>
          駅<span style={{ color: '#00d4aa' }}>検索</span>
        </h1>
        <p style={{ color: '#6b7a99', fontSize: '14px', marginBottom: '32px', lineHeight: 1.7 }}>
          駅名を入力して検索し、乗降者数・人口データを確認できます。
        </p>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
          <input
            className="search-input"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()}
            placeholder="駅名を入力（例：渋谷、新宿）"
            style={{ flex: 1, background: '#111827', border: '1px solid #1e2d45', borderRadius: '8px', padding: '12px 16px', color: '#e8edf5', fontSize: '15px' }}
          />
          <button
            onClick={search}
            style={{ background: '#00d4aa', color: '#0a0e1a', border: 'none', borderRadius: '8px', padding: '12px 24px', fontWeight: 700, fontSize: '15px', cursor: 'pointer' }}
          >
            {loading ? '検索中...' : '検索'}
          </button>
        </div>

        {stations.length > 0 && (
          <div>
            <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#6b7a99', marginBottom: '12px' }}>
              {stations.length}件ヒット
            </div>
            {stations.map(s => (
              <Link
                key={s.slug}
                href={`/station/${s.station_group_slug}`}
                className="station-item"
              >
                <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '4px' }}>
                  {s.station_name}<span style={{ color: '#00d4aa' }}>駅</span>
                </div>
                <div style={{ fontSize: '12px', color: '#6b7a99' }}>
                  {s.line_name}　{s.prefecture_name}
                </div>
              </Link>
            ))}
          </div>
        )}

        {stations.length === 0 && !loading && (
          <div style={{ textAlign: 'center', color: '#6b7a99', marginTop: '60px' }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>🚃</div>
            <div>駅名を入力して検索してください</div>
          </div>
        )}
      </section>

      <footer style={{ padding: '20px 32px', borderTop: '1px solid #1e2d45', fontFamily: 'monospace', fontSize: '11px', color: '#6b7a99', textAlign: 'center' }}>
        出典: 国土交通省 国土数値情報 | © 2025 AREASCOPE
      </footer>
    </main>
  );
}