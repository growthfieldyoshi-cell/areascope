import { neon } from '@neondatabase/serverless';
import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Breadcrumb from '@/components/Breadcrumb';

const sql = neon(process.env.DATABASE_URL!);

type PageProps = { params: Promise<{ prefectureSlug: string }> };

type RankingRow = {
  municipality_code: string;
  municipality_name: string;
  prefecture_name: string;
  prefecture_slug: string;
  municipality_slug: string;
  population: number;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { prefectureSlug } = await params;
  const rows = await sql`
    SELECT prefecture_name FROM stations
    WHERE prefecture_slug = ${prefectureSlug}
    LIMIT 1
  `;
  if (!rows[0]) return { title: '人口ランキング｜AreaScope' };
  const prefName = rows[0].prefecture_name;
  return {
    title: `${prefName}の市区町村人口ランキング【2020年】｜AreaScope`,
    description: `${prefName}の市区町村を2020年国勢調査の人口順にランキング。各自治体の人口推移・主要駅データを確認できます。`,
    alternates: {
      canonical: `https://areascope.jp/population-ranking/${prefectureSlug}`,
    },
  };
}

export default async function PrefecturePopulationRankingPage({ params }: PageProps) {
  const { prefectureSlug } = await params;

  const rows = (await sql`
    SELECT
      mp.municipality_code,
      MIN(s.municipality_name) AS municipality_name,
      MIN(s.prefecture_name)   AS prefecture_name,
      MIN(s.prefecture_slug)   AS prefecture_slug,
      MIN(s.municipality_slug) AS municipality_slug,
      mp.population
    FROM municipality_populations mp
    JOIN stations s ON s.municipality_code = mp.municipality_code
    WHERE mp.year = 2020
      AND s.prefecture_slug = ${prefectureSlug}
      AND s.municipality_slug IS NOT NULL
    GROUP BY mp.municipality_code, mp.population
    ORDER BY mp.population DESC
    LIMIT 100
  `) as RankingRow[];

  if (rows.length === 0) notFound();

  const prefName = rows[0].prefecture_name;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${prefName}の市区町村人口ランキング（2020年）`,
    numberOfItems: rows.length,
    itemListElement: rows.map((row, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: row.municipality_name,
      url: `https://areascope.jp/city/${row.prefecture_slug}/${row.municipality_slug}`,
    })),
  };

  return (
    <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px', background: '#0a0e1a', minHeight: '100vh', color: '#e8edf5', fontFamily: 'sans-serif' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <style>{`
        .ranking-table { width: 100%; border-collapse: collapse; font-size: 14px; }
        .ranking-table th { text-align: left; border-bottom: 2px solid #1e2d45; padding: 10px 8px; color: #aaa; font-weight: 700; }
        .ranking-table td { padding: 10px 8px; border-bottom: 1px solid #1e2d45; }
        .ranking-cards { display: none; }
        .ranking-card { background: #111827; border: 1px solid #1e2d45; border-radius: 8px; padding: 16px; margin-bottom: 12px; display: flex; align-items: center; gap: 16px; }
        .ranking-card-rank { font-family: monospace; font-size: 18px; font-weight: 700; color: #6b7a99; min-width: 36px; text-align: center; }
        .ranking-card-rank.top3 { color: #00d4aa; }
        .ranking-card-body { flex: 1; }
        .ranking-card-name { font-size: 16px; font-weight: 700; margin-bottom: 4px; }
        .ranking-card-meta { font-size: 12px; color: #aaa; margin-bottom: 6px; }
        .ranking-card-population { font-size: 14px; color: #3b82f6; font-family: monospace; }
        .ranking-card-btn { color: #00d4aa; text-decoration: none; font-size: 12px; border: 1px solid #00d4aa; border-radius: 4px; padding: 4px 10px; white-space: nowrap; }
        @media (max-width: 640px) {
          .ranking-table-wrap { display: none; }
          .ranking-cards { display: block; }
        }
      `}</style>

      <Breadcrumb items={[
        { label: 'TOP', href: '/' },
        { label: '全国人口ランキング', href: '/population-ranking' },
        { label: prefName },
      ]} />

      <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '12px' }}>
        {prefName}の人口<span style={{ color: '#00d4aa' }}>ランキング</span>
      </h1>
      <p style={{ marginBottom: '8px', lineHeight: 1.8, color: '#aaa', fontSize: '14px' }}>
        2020年国勢調査をもとに、{prefName}の市区町村を人口順に掲載しています。
        各自治体の詳細ページでは、人口推移・人口増減率・主要駅データも確認できます。
      </p>
      <p style={{ marginBottom: '32px', fontSize: '12px', color: '#6b7a99', fontFamily: 'monospace' }}>
        ※ {rows.length}自治体を掲載
      </p>

      {/* PC表示：テーブル */}
      <div className="ranking-table-wrap">
        <table className="ranking-table">
          <thead>
            <tr>
              {['順位', '市区町村', '人口（2020年）', ''].map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.municipality_code}>
                <td style={{ color: index < 3 ? '#00d4aa' : '#6b7a99', fontFamily: 'monospace', fontWeight: index < 3 ? 700 : 400 }}>
                  {index + 1}
                </td>
                <td style={{ fontWeight: 700 }}>
                  <Link href={`/city/${row.prefecture_slug}/${row.municipality_slug}`} style={{ textDecoration: 'none', color: '#00d4aa' }}>
                    {row.municipality_name}
                  </Link>
                </td>
                <td>{Number(row.population).toLocaleString()}人</td>
                <td>
                  <Link href={`/city/${row.prefecture_slug}/${row.municipality_slug}`} style={{ color: '#00d4aa', textDecoration: 'none', fontSize: '0.85rem', border: '1px solid #00d4aa', borderRadius: '4px', padding: '4px 10px' }}>
                    詳細
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* スマホ表示：カード */}
      <div className="ranking-cards">
        {rows.map((row, index) => (
          <div key={row.municipality_code} className="ranking-card">
            <div className={`ranking-card-rank ${index < 3 ? 'top3' : ''}`}>
              {index + 1}
            </div>
            <div className="ranking-card-body">
              <div className="ranking-card-name">
                <Link href={`/city/${row.prefecture_slug}/${row.municipality_slug}`} style={{ textDecoration: 'none', color: '#e8edf5' }}>
                  {row.municipality_name}
                </Link>
              </div>
              <div className="ranking-card-population">
                {Number(row.population).toLocaleString()}人
              </div>
            </div>
            <Link href={`/city/${row.prefecture_slug}/${row.municipality_slug}`} className="ranking-card-btn">
              詳細
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}