import { neon } from '@neondatabase/serverless';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

const sql = neon(process.env.DATABASE_URL!);

type PageProps = {
  params: Promise<{ slug: string }>;
};

type StationRow = {
  station_name: string;
  line_name: string;
  operator_name: string;
  slug: string;
  municipality_code: string | null;
  municipality_name: string | null;
  prefecture_name: string | null;
};

type PopulationRow = {
  year: number;
  population: number;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const rows = await sql<StationRow[]>`
    SELECT s.station_name, s.line_name, s.prefecture_name, s.municipality_name
    FROM stations s
    WHERE s.slug = ${slug}
    LIMIT 1
  `;
  const station = rows[0];
  if (!station) return { title: '駅情報が見つかりません | AreaScope' };
  return {
    title: `${station.station_name}駅の人口推移・エリア情報｜AreaScope`,
    description: `${station.station_name}駅（${station.prefecture_name}${station.municipality_name}）周辺エリアの人口推移・不動産投資情報を掲載。`,
  };
}

export default async function StationDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const stationRows = await sql<StationRow[]>`
    SELECT
      s.station_name,
      s.line_name,
      s.operator_name,
      s.slug,
      s.municipality_code,
      s.municipality_name,
      s.prefecture_name
    FROM stations s
    WHERE s.slug = ${slug}
    LIMIT 1
  `;

  const station = stationRows[0];
  if (!station) notFound();

  const populationRows = await sql<PopulationRow[]>`
    SELECT mp.year, mp.population
    FROM municipality_populations mp
    WHERE mp.municipality_code = ${station.municipality_code}
    ORDER BY mp.year
  `;

  const maxPop = populationRows.length > 0 ? Math.max(...populationRows.map(r => r.population)) : 1;
  const latest = populationRows[populationRows.length - 1];
  const oldest = populationRows[0];
  const change = latest && oldest
    ? ((latest.population - oldest.population) / oldest.population * 100).toFixed(1)
    : null;

  return (
    <main style={{ minHeight: '100vh', background: '#0a0e1a', color: '#e8edf5', fontFamily: "'Noto Sans JP', sans-serif" }}>
      <style>{`
        .bar-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
        .bar-label { font-family: monospace; font-size: 11px; color: #6b7a99; width: 40px; text-align: right; }
        .bar-bg { flex: 1; background: #1e2d45; border-radius: 4px; height: 28px; }
        .bar-fill { background: #00d4aa; border-radius: 4px; height: 28px; display: flex; align-items: center; padding-left: 8px; font-size: 11px; font-family: monospace; color: #0a0e1a; font-weight: 700; }
        .kpi { background: #111827; border: 1px solid #1e2d45; border-radius: 12px; padding: 16px 20px; }
      `}</style>

      <header style={{ padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1e2d45', background: 'rgba(10,14,26,0.95)' }}>
        <a href="/" style={{ fontSize: '22px', fontWeight: 800, textDecoration: 'none', color: '#e8edf5' }}>
          AREA<span style={{ color: '#00d4aa' }}>SCOPE</span>
        </a>
        <a href="/station-ranking" style={{ fontFamily: 'monospace', fontSize: '12px', color: '#6b7a99', background: '#111827', border: '1px solid #1e2d45', padding: '6px 12px', borderRadius: '6px', textDecoration: 'none' }}>
          🚃 駅ランキング
        </a>
      </header>

      <section style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 32px', boxSizing: 'border-box' }}>
        <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#00d4aa', letterSpacing: '3px', marginBottom: '12px' }}>
          // 駅エリア分析
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '8px' }}>
          {station.station_name}駅<span style={{ color: '#00d4aa' }}>の人口推移</span>
        </h1>
        <p style={{ color: '#6b7a99', fontFamily: 'monospace', fontSize: '12px', marginBottom: '32px' }}>
          {station.prefecture_name} / {station.municipality_name} / {station.line_name} / {station.operator_name}
        </p>

        {populationRows.length > 0 ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '32px' }}>
              <div className="kpi">
                <div style={{ fontSize: '11px', color: '#6b7a99', fontFamily: 'monospace', marginBottom: '8px' }}>最新人口（{latest?.year}年）</div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#00d4aa' }}>{latest?.population.toLocaleString()}</div>
                <div style={{ fontSize: '11px', color: '#6b7a99' }}>人</div>
              </div>
              <div className="kpi">
                <div style={{ fontSize: '11px', color: '#6b7a99', fontFamily: 'monospace', marginBottom: '8px' }}>1995年人口</div>
                <div style={{ fontSize: '28px', fontWeight: 800 }}>{oldest?.population.toLocaleString()}</div>
                <div style={{ fontSize: '11px', color: '#6b7a99' }}>人</div>
              </div>
              <div className="kpi">
                <div style={{ fontSize: '11px', color: '#6b7a99', fontFamily: 'monospace', marginBottom: '8px' }}>長期変化（1995年比）</div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: parseFloat(change || '0') >= 0 ? '#00d4aa' : '#ff4757' }}>
                  {parseFloat(change || '0') >= 0 ? '▲' : '▼'}{Math.abs(parseFloat(change || '0'))}%
                </div>
              </div>
            </div>

            <div style={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: '12px', padding: '24px', marginBottom: '32px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '20px' }}>
                {station.municipality_name}の人口推移グラフ
              </div>
              {populationRows.map(row => (
                <div key={row.year} className="bar-row">
                  <div className="bar-label">{row.year}</div>
                  <div className="bar-bg">
                    <div className="bar-fill" style={{ width: `${(row.population / maxPop) * 100}%` }}>
                      {row.population.toLocaleString()}人
                    </div>
                  </div>
                </div>
              ))}
              <div style={{ fontSize: '11px', color: '#6b7a99', fontFamily: 'monospace', marginTop: '12px' }}>
                出典：総務省統計局 国勢調査（e-Stat API）
              </div>
            </div>
          </>
        ) : (
          <div style={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: '12px', padding: '24px', marginBottom: '32px', color: '#6b7a99' }}>
            人口データが取得できませんでした
          </div>
        )}

        <div style={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: '12px', padding: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>
            {station.station_name}駅のエリア概要
          </h2>
          <p style={{ color: '#a0aec0', lineHeight: 1.8, fontSize: '14px' }}>
            {station.station_name}駅は{station.prefecture_name}{station.municipality_name}にある{station.line_name}の駅です。
            {station.municipality_name}の人口は1995年から2020年にかけて
            {parseFloat(change || '0') >= 0 ? `${change}%増加` : `${Math.abs(parseFloat(change || '0'))}%減少`}しています。
            不動産投資の観点では、人口推移はエリアの需要を判断する重要な指標のひとつです。
          </p>
        </div>
      </section>

      <footer style={{ padding: '20px 32px', borderTop: '1px solid #1e2d45', fontFamily: 'monospace', fontSize: '11px', color: '#6b7a99', textAlign: 'center' }}>
        出典: 総務省統計局 国勢調査（e-Stat API）| © 2025 AREASCOPE
      </footer>
    </main>
  );
}