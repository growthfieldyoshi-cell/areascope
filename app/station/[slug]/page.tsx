// app/station/[slug]/page.tsx
import { neon } from '@neondatabase/serverless';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Breadcrumb from '@/components/Breadcrumb';

const sql = neon(process.env.DATABASE_URL!);

type PageProps = { params: Promise<{ slug: string }> };

type StationRow = {
  station_name: string;
  line_name: string;
  operator_name: string;
  prefecture_name: string;
  municipality_name: string;
  municipality_code: string;
  prefecture_slug: string;
  municipality_slug: string;
};

type PassengerRow = { year: number; passengers: number | null };
type PopulationRow = { year: number; population: number };
type NearbyStationRow = {
  station_name: string;
  station_group_slug: string;
  passengers_2021: number | null;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const rows = await sql`
    SELECT station_name, prefecture_name, municipality_name
    FROM stations
    WHERE station_group_slug = ${slug}
    LIMIT 1
  `;

  const station = rows[0];

  if (!station) {
    return { title: '駅が見つかりません｜AreaScope' };
  }

  return {
    title: `${station.station_name}駅｜AreaScope`,
    description: `${station.prefecture_name}${station.municipality_name}にある${station.station_name}駅の路線・乗降者数・人口データを掲載しています。`,
    alternates: {
      canonical: `https://areascope.jp/station/${slug}`,
    },
  };
}

export default async function StationPage({ params }: PageProps) {
  const { slug } = await params;

  const stationRows = (await sql`
    SELECT DISTINCT ON (line_name)
      station_name,
      line_name,
      operator_name,
      prefecture_name,
      municipality_name,
      municipality_code,
      prefecture_slug,
      municipality_slug
    FROM stations
    WHERE station_group_slug = ${slug}
    ORDER BY line_name, station_name
  `) as StationRow[];

  if (stationRows.length === 0) {
    notFound();
  }

  const station = stationRows[0];

  const passengerRows = (await sql`
    SELECT
      sp.year,
      CAST(SUM(sp.passengers) AS bigint) AS passengers
    FROM station_passengers sp
    JOIN stations s ON s.station_key = sp.station_key
    WHERE s.station_group_slug = ${slug}
    GROUP BY sp.year
    ORDER BY sp.year ASC
  `) as PassengerRow[];

  const populationRows = (await sql`
    SELECT year, population
    FROM municipality_populations
    WHERE municipality_code = ${station.municipality_code}
    ORDER BY year ASC
  `) as PopulationRow[];

  // 同自治体の主要駅（自駅除く・2021年乗降者数順・最大10件）
  const nearbyStations = (await sql`
    SELECT
      t.station_name,
      t.station_group_slug,
      t.passengers_2021
    FROM (
      SELECT
        s.station_group_slug,
        MIN(s.station_name) AS station_name,
        CAST(SUM(sp.passengers) AS bigint) AS passengers_2021
      FROM stations s
      LEFT JOIN station_passengers sp
        ON sp.station_key = s.station_key
       AND sp.year = 2021
      WHERE s.municipality_code = ${station.municipality_code}
        AND s.station_group_slug IS NOT NULL
        AND s.station_group_slug <> ${slug}
      GROUP BY s.station_group_slug
    ) t
    ORDER BY t.passengers_2021 DESC NULLS LAST, t.station_name ASC
    LIMIT 10
  `) as NearbyStationRow[];

  const maxPassengers = Math.max(
    ...passengerRows.map((r) => Number(r.passengers ?? 0)),
    1
  );

  const maxPopulation = Math.max(
    ...populationRows.map((r) => r.population),
    1
  );

  return (
    <main
      style={{
        maxWidth: '960px',
        margin: '0 auto',
        padding: '40px 20px',
        background: '#0a0e1a',
        minHeight: '100vh',
        color: '#e8edf5',
        fontFamily: 'sans-serif',
      }}
    >
      <style>{`
        @media (max-width: 640px) {
          .station-title { font-size: 24px !important; }
          .station-meta { font-size: 13px !important; }
          .passenger-bar-label { font-size: 11px !important; }
          .section-title { font-size: 17px !important; }
        }
        .nearby-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          border-radius: 8px;
          background: #111827;
          border: 1px solid #1e2d45;
          text-decoration: none;
          color: #e8edf5;
          margin-bottom: 8px;
        }
        .nearby-item:hover {
          border-color: #00d4aa;
        }
      `}</style>

      <Breadcrumb
        items={[
          { label: 'TOP', href: '/' },
          { label: station.municipality_name, href: `/city/${station.prefecture_slug}/${station.municipality_slug}` },
          { label: `${station.station_name}駅` },
        ]}
      />

      <h1
        className="station-title"
        style={{ fontSize: '32px', fontWeight: 800, marginBottom: '8px' }}
      >
        {station.station_name}
        <span style={{ color: '#00d4aa' }}>駅</span>
      </h1>

      <div
        className="station-meta"
        style={{ lineHeight: 2, marginBottom: '40px', color: '#aaa', fontSize: '14px' }}
      >
        <div>
          <strong style={{ color: '#e8edf5' }}>所在地:</strong>{' '}
          <Link
            href={`/city/${station.prefecture_slug}/${station.municipality_slug}`}
            style={{ color: '#00d4aa', textDecoration: 'none' }}
          >
            {station.prefecture_name}
            {station.municipality_name}
          </Link>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
          <strong style={{ color: '#e8edf5' }}>路線:</strong>
          {stationRows.map((r, i) => (
            <span
              key={i}
              style={{
                background: '#1e2d45',
                borderRadius: '4px',
                padding: '2px 8px',
                fontSize: '13px',
                color: '#e8edf5',
              }}
            >
              {r.line_name}
            </span>
          ))}
        </div>
      </div>

      <section style={{ marginBottom: '48px' }}>
        <h2
          className="section-title"
          style={{ fontSize: '20px', fontWeight: 800, marginBottom: '20px' }}
        >
          乗降者数
          <span style={{ color: '#00d4aa' }}>推移</span>
        </h2>

        {passengerRows.length === 0 ? (
          <p style={{ color: '#aaa' }}>乗降者数データがありません。</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {passengerRows.map((row) => {
              const pct = maxPassengers > 0 ? (Number(row.passengers ?? 0) / maxPassengers) * 100 : 0;

              return (
                <div key={row.year} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '40px',
                      textAlign: 'right',
                      fontFamily: 'monospace',
                      fontSize: '12px',
                      color: '#6b7a99',
                      flexShrink: 0,
                    }}
                  >
                    {row.year}
                  </div>

                  <div style={{ flex: 1, background: '#1e2d45', borderRadius: '4px', height: '28px', minWidth: 0 }}>
                    <div
                      className="passenger-bar-label"
                      style={{
                        width: `${pct}%`,
                        background: '#00d4aa',
                        borderRadius: '4px',
                        height: '28px',
                        display: 'flex',
                        alignItems: 'center',
                        paddingLeft: '8px',
                        fontSize: '12px',
                        fontFamily: 'monospace',
                        color: '#0a0e1a',
                        fontWeight: 700,
                        minWidth: pct > 0 ? '60px' : '0',
                        overflow: 'hidden',
                      }}
                    >
                      {row.passengers != null ? Number(row.passengers).toLocaleString() : '－'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section style={{ marginBottom: '48px' }}>
        <h2
          className="section-title"
          style={{ fontSize: '20px', fontWeight: 800, marginBottom: '4px' }}
        >
          {station.municipality_name}の人口
          <span style={{ color: '#00d4aa' }}>推移</span>
        </h2>

        <p style={{ fontSize: '13px', color: '#6b7a99', marginBottom: '20px' }}>
          <Link
            href={`/city/${station.prefecture_slug}/${station.municipality_slug}`}
            style={{ color: '#00d4aa', textDecoration: 'none' }}
          >
            {station.municipality_name}の詳細ページ →
          </Link>
        </p>

        {populationRows.length === 0 ? (
          <p style={{ color: '#aaa' }}>人口データがありません。</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {populationRows.map((row) => {
              const pct = maxPopulation > 0 ? (row.population / maxPopulation) * 100 : 0;

              return (
                <div key={row.year} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '40px',
                      textAlign: 'right',
                      fontFamily: 'monospace',
                      fontSize: '12px',
                      color: '#6b7a99',
                      flexShrink: 0,
                    }}
                  >
                    {row.year}
                  </div>

                  <div style={{ flex: 1, background: '#1e2d45', borderRadius: '4px', height: '28px', minWidth: 0 }}>
                    <div
                      style={{
                        width: `${pct}%`,
                        background: '#3b82f6',
                        borderRadius: '4px',
                        height: '28px',
                        display: 'flex',
                        alignItems: 'center',
                        paddingLeft: '8px',
                        fontSize: '12px',
                        fontFamily: 'monospace',
                        color: '#fff',
                        fontWeight: 700,
                        minWidth: pct > 0 ? '80px' : '0',
                        overflow: 'hidden',
                      }}
                    >
                      {row.population.toLocaleString()}人
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {nearbyStations.length > 0 && (
        <section style={{ marginBottom: '48px' }}>
          <h2
            className="section-title"
            style={{ fontSize: '20px', fontWeight: 800, marginBottom: '4px' }}
          >
            {station.municipality_name}の
            <span style={{ color: '#00d4aa' }}>主要駅</span>
          </h2>

          <p style={{ fontSize: '13px', color: '#6b7a99', marginBottom: '20px' }}>
            同じ自治体にある駅（2021年乗降者数順）
          </p>

          <div>
            {nearbyStations.map((s) => (
              <Link
                key={s.station_group_slug}
                href={`/station/${s.station_group_slug}`}
                className="nearby-item"
              >
                <span style={{ fontWeight: 700 }}>
                  {s.station_name}
                  <span style={{ color: '#00d4aa' }}>駅</span>
                </span>

                <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#6b7a99' }}>
                  {s.passengers_2021 != null
                    ? `${Number(s.passengers_2021).toLocaleString()}人`
                    : 'データなし'}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}