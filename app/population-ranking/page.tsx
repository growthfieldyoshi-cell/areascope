import { neon } from '@neondatabase/serverless';
import Link from 'next/link';
import type { Metadata } from 'next';
import Breadcrumb from '@/components/Breadcrumb';

const sql = neon(process.env.DATABASE_URL!);

export const metadata: Metadata = {
  title: '全国市区町村人口ランキング【2020年】｜AreaScope',
  description: '2020年国勢調査をもとに、日本全国の市区町村を人口順にランキング。各自治体の人口推移・主要駅データを確認できます。上位100自治体を掲載。',
  alternates: {
    canonical: 'https://areascope.jp/population-ranking',
  },
};

type RankingRow = {
  municipality_code: string;
  municipality_name: string;
  prefecture_name: string;
  prefecture_slug: string;
  municipality_slug: string;
  population: number;
};

export default async function PopulationRankingPage() {
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
      AND s.municipality_slug IS NOT NULL
      AND s.prefecture_slug IS NOT NULL
    GROUP BY mp.municipality_code, mp.population
    ORDER BY mp.population DESC
    LIMIT 100
  `) as RankingRow[];

  // ランキング内に登場する都道府県を重複なしで抽出
  const prefectures = Array.from(
    new Map(
      rows
        .filter((r) => r.prefecture_slug)
        .map((r) => [r.prefecture_slug, r.prefecture_name])
    ).entries()
  ).map(([slug, name]) => ({ slug, name }));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: '全国市区町村人口ランキング（2020年）',
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
      {/* JSON-LD */}
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
        .pref-link { display: inline-block; font-size: 12px; color: #6b7a99; background: #111827; border: 1px solid #1e2d45; border-radius: 4px; padding: 4px 10px; text-decoration: none; margin: 4px 4px 4px 0; }
        .pref-link:hover { border-color: #00d4aa; color: #00d4aa; }
        @media (max-width: 640px) {
          .ranking-table-wrap { display: none; }
          .ranking-cards { display: block; }
        }
      `}</style>

      <Breadcrumb items={[
        { label: 'TOP', href: '/' },
        { label: '全国人口ランキング' },
      ]} />

      <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '12px' }}>
        全国人口<span style={{ color: '#00d4aa' }}>ランキング</span>
      </h1>
      <p style={{ marginBottom: '8px', lineHeight: 1.8, color: '#aaa', fontSize: '14px' }}>
        2020年国勢調査をもとに、日本全国の市区町村を人口順に掲載しています。
        各自治体の詳細ページでは、人口推移・人口増減率・主要駅データも確認できます。
      </p>
      <p style={{ marginBottom: '24px', fontSize: '12px', color: '#6b7a99', fontFamily: 'monospace' }}>
        ※ 上位100自治体を掲載
      </p>

      {/* 都道府県別ランキング導線 */}
      <div style={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: '8px', padding: '16px 20px', marginBottom: '32px' }}>
        <div style={{ fontSize: '12px', color: '#6b7a99', fontFamily: 'monospace', marginBottom: '10px' }}>
          // 都道府県別ランキング
        </div>
        <div>
          {prefectures.map(p => (
            <Link key={p.slug} href={`/population-ranking/${p.slug}`} className="pref-link">
              {p.name}
            </Link>
          ))}
        </div>
      </div>

      {/* PC表示：テーブル */}
      <div className="ranking-table-wrap">
        <table className="ranking-table">
          <thead>
            <tr>
              {['順位', '市区町村', '都道府県', '人口（2020年）', ''].map(h => (
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
                <td style={{ color: '#aaa' }}>{row.prefecture_name}</td>
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
              <div className="ranking-card-meta">{row.prefecture_name}</div>
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