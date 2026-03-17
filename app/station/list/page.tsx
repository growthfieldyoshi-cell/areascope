// app/station/list/page.tsx
import { neon } from '@neondatabase/serverless';
import Link from 'next/link';
import type { Metadata } from 'next';
import Breadcrumb from '@/components/Breadcrumb';

const sql = neon(process.env.DATABASE_URL!);
const PER_PAGE = 100;

export const metadata: Metadata = {
  title: '駅乗降者数データ一覧｜全国駅データ',
  description: '全国の駅乗降者数データを一覧で確認できます。駅ごとの利用者数推移やランキングも確認可能です。',
  alternates: {
    canonical: 'https://areascope.jp/station/list',
  },
};

type Props = { searchParams: Promise<{ page?: string }> };

type StationRow = {
  station_name: string;
  prefecture_name: string;
  municipality_name: string;
  station_group_slug: string;
  passengers: number | null;
};

export default async function StationListPage({ searchParams }: Props) {
  const { page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page ?? '1', 10));
  const offset = (currentPage - 1) * PER_PAGE;

  const [rows, countRows] = await Promise.all([
    sql`
      WITH grouped AS (
        SELECT DISTINCT ON (s.station_group_slug)
          s.station_name,
          s.prefecture_name,
          s.municipality_name,
          s.station_group_slug
        FROM stations s
        WHERE s.station_group_slug IS NOT NULL
        ORDER BY s.station_group_slug, s.station_name
      )
      SELECT
        g.station_name,
        g.prefecture_name,
        g.municipality_name,
        g.station_group_slug,
        CAST(SUM(sp.passengers) AS bigint) AS passengers
      FROM grouped g
      LEFT JOIN stations s ON s.station_group_slug = g.station_group_slug
      LEFT JOIN station_passengers sp ON sp.station_key = s.station_key AND sp.year = 2021
      GROUP BY g.station_name, g.prefecture_name, g.municipality_name, g.station_group_slug
      ORDER BY passengers DESC NULLS LAST
      LIMIT ${PER_PAGE} OFFSET ${offset}
    `,
    sql`SELECT COUNT(DISTINCT station_group_slug) as cnt FROM stations WHERE station_group_slug IS NOT NULL`,
  ]) as [StationRow[], { cnt: number }[]];

  const total = Number(countRows[0].cnt);
  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <main style={{ background: '#0a0e1a', minHeight: '100vh', color: '#e8edf5', padding: '2rem', fontFamily: 'sans-serif', maxWidth: '960px', margin: '0 auto' }}>
      <style>{`
        .list-table-wrap { overflow-x: auto; }
        .list-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
        .list-table th { padding: 12px 16px; text-align: left; color: #aaa; border-bottom: 2px solid #1e2d45; }
        .list-table td { padding: 10px 16px; border-bottom: 1px solid #1e2d45; }
        .list-cards { display: none; }
        .list-card { background: #111827; border: 1px solid #1e2d45; border-radius: 8px; padding: 14px 16px; margin-bottom: 10px; display: flex; align-items: center; gap: 12px; }
        .list-card-body { flex: 1; }
        .list-card-name { font-size: 15px; font-weight: 700; margin-bottom: 4px; }
        .list-card-meta { font-size: 12px; color: #aaa; margin-bottom: 4px; }
        .list-card-passengers { font-size: 13px; color: #00d4aa; font-family: monospace; }
        .list-card-btn { color: #00d4aa; text-decoration: none; font-size: 12px; border: 1px solid #00d4aa; border-radius: 4px; padding: 4px 10px; white-space: nowrap; }
        @media (max-width: 640px) {
          .list-table-wrap { display: none; }
          .list-cards { display: block; }
        }
      `}</style>

      <Breadcrumb items={[
        { label: 'TOP', href: '/' },
        { label: '駅一覧' },
      ]} />

      <h1 style={{ fontSize: '1.8rem', color: '#00d4aa', marginBottom: '0.5rem' }}>
        駅乗降者数データ一覧
      </h1>
      <p style={{ color: '#aaa', marginBottom: '0.5rem' }}>
        全国の駅乗降者数データを一覧で確認できます。駅ごとの詳細ページへ移動できます。
      </p>
      <p style={{ color: '#aaa', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
        全{total.toLocaleString()}駅 ／ {currentPage} / {totalPages}ページ
      </p>

      {/* PC表示：テーブル */}
      <div className="list-table-wrap" style={{ background: '#111827', borderRadius: '8px', overflow: 'hidden', marginBottom: '1.5rem' }}>
        <table className="list-table">
          <thead>
            <tr>
              {['駅名', '都道府県', '自治体', '2021年乗降者数', ''].map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.station_group_slug}>
                <td style={{ fontWeight: 'bold' }}>
                  <Link href={`/station/${r.station_group_slug}`} style={{ color: '#e8edf5', textDecoration: 'none' }}>
                    {r.station_name}駅
                  </Link>
                </td>
                <td style={{ color: '#aaa' }}>{r.prefecture_name}</td>
                <td style={{ color: '#aaa' }}>{r.municipality_name}</td>
                <td>{r.passengers != null ? `${Number(r.passengers).toLocaleString()}人` : 'データなし'}</td>
                <td>
                  <Link href={`/station/${r.station_group_slug}`} style={{ color: '#00d4aa', textDecoration: 'none', fontSize: '0.85rem', border: '1px solid #00d4aa', borderRadius: '4px', padding: '4px 10px' }}>
                    詳細
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* スマホ表示：カード */}
      <div className="list-cards" style={{ marginBottom: '1.5rem' }}>
        {rows.map((r) => (
          <div key={r.station_group_slug} className="list-card">
            <div className="list-card-body">
              <div className="list-card-name">
                <Link href={`/station/${r.station_group_slug}`} style={{ textDecoration: 'none', color: '#e8edf5' }}>
                  {r.station_name}駅
                </Link>
              </div>
              <div className="list-card-meta">{r.prefecture_name} {r.municipality_name}</div>
              <div className="list-card-passengers">
                {r.passengers != null ? `${Number(r.passengers).toLocaleString()}人` : 'データなし'}
              </div>
            </div>
            <Link href={`/station/${r.station_group_slug}`} className="list-card-btn">
              詳細
            </Link>
          </div>
        ))}
      </div>

      {/* ページネーション */}
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {currentPage > 1 && (
          <Link href={`/station/list?page=${currentPage - 1}`} style={{ color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '4px', padding: '6px 14px', textDecoration: 'none', fontSize: '0.9rem' }}>
            ← 前へ
          </Link>
        )}
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          const p = Math.max(1, Math.min(currentPage - 2, totalPages - 4)) + i;
          return (
            <Link key={p} href={`/station/list?page=${p}`} style={{ color: p === currentPage ? '#0a0e1a' : '#00d4aa', background: p === currentPage ? '#00d4aa' : 'transparent', border: '1px solid #00d4aa', borderRadius: '4px', padding: '6px 14px', textDecoration: 'none', fontSize: '0.9rem' }}>
              {p}
            </Link>
          );
        })}
        {currentPage < totalPages && (
          <Link href={`/station/list?page=${currentPage + 1}`} style={{ color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '4px', padding: '6px 14px', textDecoration: 'none', fontSize: '0.9rem' }}>
            次へ →
          </Link>
        )}
      </div>
    </main>
  );
}