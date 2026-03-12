import { neon } from '@neondatabase/serverless';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

const sql = neon(process.env.DATABASE_URL!);

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const rows = await sql`SELECT * FROM stations WHERE romanized_name = ${slug} LIMIT 1`;
  if (!rows[0]) return { title: '駅が見つかりません' };
  const s = rows[0];
  return {
    title: `${s.station_name}駅の乗降客数推移 | AREASCOPE`,
    description: `${s.station_name}駅（${s.line_name}・${s.prefecture}）の2011〜2021年の乗降客数データ。不動産投資・エリア分析に。`,
  };
}

export default async function StationPage({ params }: Props) {
  const { slug } = await params;
  const rows = await sql`SELECT * FROM stations WHERE romanized_name = ${slug} LIMIT 1`;
  if (!rows[0]) notFound();
  const s = rows[0];

  const years = [2011,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021];
  const data = years.map(y => ({ year: y, passengers: s[`passengers_${y}`] ?? 0 }));
  const max = Math.max(...data.map(d => d.passengers));

  return (
    <main style={{ background: '#0a0e1a', minHeight: '100vh', color: '#e8edf5', padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', color: '#00d4aa' }}>{s.station_name}駅</h1>
      <p style={{ color: '#aaa' }}>{s.line_name} ／ {s.prefecture}</p>

      <section style={{ marginTop: '2rem' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>乗降客数推移（2011〜2021年）</h2>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '200px' }}>
          {data.map(d => (
            <div key={d.year} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <div style={{
                background: '#00d4aa',
                width: '100%',
                height: max > 0 ? `${(d.passengers / max) * 180}px` : '4px',
                borderRadius: '4px 4px 0 0'
              }} />
              <span style={{ fontSize: '0.6rem', color: '#aaa', marginTop: '4px' }}>{d.year}</span>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginTop: '2rem', background: '#111827', padding: '1rem', borderRadius: '8px' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>基本情報</h2>
        <p>路線：{s.line_name}</p>
        <p>都道府県：{s.prefecture}</p>
        <p>2021年乗降客数：{s.passengers_2021?.toLocaleString() ?? 'データなし'}人</p>
      </section>
    </main>
  );
}