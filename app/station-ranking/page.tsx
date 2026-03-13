import { neon } from '@neondatabase/serverless';
import Link from 'next/link';
import type { Metadata } from 'next';

const sql = neon(process.env.DATABASE_URL!);

export const metadata: Metadata = {
  title: '日本の主要駅一覧｜AreaScope',
  description: '日本全国の主要駅と、駅が属する自治体の人口データを掲載。不動産投資のエリア分析にご活用ください。',
};

type RankingRow = {
  station_name: string;
  line_name: string;
  operator_name: string;
  slug: string;
  municipality_name: string;
  prefecture_name: string;
  population: number | null;
};

export default async function StationRankingPage() {
  const rows = await sql<RankingRow[]>`
    SELECT
      s.station_name,
      s.line_name,
      s.operator_name,
      s.slug,
      s.municipality_name,
      s.prefecture_name,
      mp.population
    FROM stations s
    LEFT JOIN municipalities m
      ON s.municipality_code = m.jis_code
    LEFT JOIN municipality_populations mp
      ON m.jis_code = mp.municipality_code
      AND mp.year = 2020
    WHERE s.slug IS NOT NULL
    ORDER BY mp.population DESC NULLS LAST
    LIMIT 100
  `;

  return (
    <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '16px' }}>
        日本の主要駅一覧
      </h1>

      <p style={{ marginBottom: '24px', lineHeight: 1.8 }}>
        駅が属する自治体の人口（2020年）順に掲載しています。
        各駅ページでは、エリアの人口推移や不動産投資情報を確認できます。
      </p>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={thStyle}>順位</th>
            <th style={thStyle}>駅名</th>
            <th style={thStyle}>路線</th>
            <th style={thStyle}>運営会社</th>
            <th style={thStyle}>所在地</th>
            <th style={thStyle}>自治体人口（2020年）</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={`${row.slug}-${index}`}>
              <td style={tdStyle}>{index + 1}</td>
              <td style={tdStyle}>
                <Link href={`/station/${row.slug}`} style={{ textDecoration: 'none' }}>
                  {row.station_name}
                </Link>
              </td>
              <td style={tdStyle}>{row.line_name}</td>
              <td style={tdStyle}>{row.operator_name}</td>
              <td style={tdStyle}>{row.prefecture_name}{row.municipality_name}</td>
              <td style={tdStyle}>
                {row.population ? row.population.toLocaleString() : '-'}人
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  borderBottom: '1px solid #ccc',
  padding: '10px 8px',
  fontWeight: 700,
};

const tdStyle: React.CSSProperties = {
  borderBottom: '1px solid #eee',
  padding: '10px 8px',
  verticalAlign: 'top',
};