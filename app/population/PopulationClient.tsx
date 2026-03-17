'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Municipality = {
  municipality_code: string;
  municipality_name: string;
  prefecture_name: string;
  prefecture_slug: string;
  municipality_slug: string;
};

export default function PopulationClient() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Municipality[]>([]);
  const [searching, setSearching] = useState(false);

  const search = async () => {
    if (!query.trim()) return;
    setSearching(true);
    const res = await fetch(`/api/municipalities?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    setResults(data.municipalities ?? []);
    setSearching(false);
  };

  const selectMunicipality = (m: Municipality) => {
    router.push(`/city/${m.prefecture_slug}/${m.municipality_slug}`);
  };

  return (
    <main style={{ minHeight: '100vh', background: '#0a0e1a', color: '#e8edf5', fontFamily: "'Noto Sans JP', sans-serif", display: 'flex', flexDirection: 'column' }}>
      <style>{`
        .search-input:focus { outline: none; border-color: #00d4aa; }
        .result-item { padding: 12px 16px; border-radius: 8px; margin-bottom: 6px; background: #111827; border: 1px solid #1e2d45; cursor: pointer; }
        .result-item:hover { border-color: #00d4aa; }
        @media (max-width: 640px) {
          .content { padding: 24px 16px !important; }
        }
      `}</style>

      <header style={{ padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1e2d45', background: 'rgba(10,14,26,0.95)' }}>
        <a href="/" style={{ fontSize: '22px', fontWeight: 800, textDecoration: 'none', color: '#e8edf5' }}>
          AREA<span style={{ color: '#00d4aa' }}>SCOPE</span>
        </a>
        <a href="/station" style={{ fontFamily: 'monospace', fontSize: '12px', color: '#6b7a99', background: '#111827', border: '1px solid #1e2d45', padding: '6px 12px', borderRadius: '6px', textDecoration: 'none' }}>
          🚃 駅検索
        </a>
      </header>

      <section className="content" style={{ flex: 1, padding: '40px 32px', maxWidth: '760px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#00d4aa', letterSpacing: '3px', marginBottom: '12px' }}>
          // 市区町村検索
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '8px' }}>
          人口<span style={{ color: '#00d4aa' }}>推移</span>
        </h1>
        <p style={{ color: '#6b7a99', fontSize: '14px', marginBottom: '32px', lineHeight: 1.7 }}>
          市区町村名を入力して人口推移データを確認できます。
        </p>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <input
            className="search-input"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setResults([]); }}
            onKeyDown={(e) => e.key === 'Enter' && search()}
            placeholder="市区町村名を入力（例：渋谷区、茅ヶ崎市）"
            style={{ flex: 1, background: '#111827', border: '1px solid #1e2d45', borderRadius: '8px', padding: '12px 16px', color: '#e8edf5', fontSize: '15px' }}
          />
          <button
            onClick={search}
            style={{ background: '#00d4aa', color: '#0a0e1a', border: 'none', borderRadius: '8px', padding: '12px 24px', fontWeight: 700, fontSize: '15px', cursor: 'pointer' }}
          >
            {searching ? '検索中...' : '検索'}
          </button>
        </div>

        {results.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#6b7a99', marginBottom: '12px' }}>
              {results.length}件ヒット
            </div>
            {results.map((m) => (
              <div
                key={`${m.prefecture_slug}-${m.municipality_slug}`}
                className="result-item"
                onClick={() => selectMunicipality(m)}
              >
                <div style={{ fontWeight: 700, fontSize: '15px' }}>{m.municipality_name}</div>
                <div style={{ fontSize: '12px', color: '#6b7a99', marginTop: '2px' }}>{m.prefecture_name}</div>
              </div>
            ))}
          </div>
        )}

        {!searching && results.length === 0 && (
          <div style={{ textAlign: 'center', color: '#6b7a99', marginTop: '60px' }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>🏙️</div>
            <div>市区町村名を入力して検索してください</div>
          </div>
        )}
      </section>

      <footer style={{ padding: '20px 32px', borderTop: '1px solid #1e2d45', fontFamily: 'monospace', fontSize: '11px', color: '#6b7a99', textAlign: 'center' }}>
        出典: 総務省統計局 国勢調査 | © 2025 AREASCOPE
      </footer>
    </main>
  );
}