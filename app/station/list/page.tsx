import { neon } from '@neondatabase/serverless';
import Link from 'next/link';
import type { Metadata } from 'next';

const sql = neon(process.env.DATABASE_URL!);
const PER_PAGE = 100;

export const metadata: Metadata = {
  title: '駅乗降者数データ一覧｜全国駅データ',
  description: '全国の駅乗降者数データを一覧で確認できます。駅ごとの利用者数推移やランキングも確認可能です。',
};

type Props = { searchParams: Promise<{ page?: string }> };

export default async function StationListPage({ searchParams }: Props) {
  const { page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page ?? '1', 10));
  const offset = (currentPage - 1) * PER_PAGE;

  const [rows, countRows] = await Promise.all([
    sql`
      SELECT station_name, line_name, prefecture, slug, passengers_2021
      FROM stations
      ORDER BY passengers_2021 DESC NULLS LAST
      LIMIT ${PER_PAGE} OFFSET ${offset}
    `,
    sql`SELECT COUNT(*) as cnt FROM stations`,
  ]);

  const total = Number(countRows[0].cnt);
  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <main style={{ background: '#0a0e1a', minHeight: '100vh', color: '#e8edf5', padding: '2rem', fontFamily: 'sans-serif', maxWidth: '960px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.8rem', color: '#00d4aa', marginBottom: '0.5rem' }}>
        駅乗降者数データ一覧
      </h1>
      <p style={{ color: '#aaa', marginBottom: '0.5rem' }}>
        全国の駅乗降者数データを一覧で確認できます。駅ごとの詳細ページへ移動できます。
      </p>
      <p style={{ color: '#aaa', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
        全{total.toLocaleString()}駅 ／ {currentPage} / {totalPages}ページ
      </p>

      <div style={{ background: '#111827', borderRadius: '8px', overflow: 'hidden', marginBottom: '1.5rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #1e2d45' }}>
              {['駅名', '路線', '都道府県', '2021年乗降者数', ''].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#aaa' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #1e2d45' }}>
                <td style={{ padding: '10px 16px', fontWeight: 'bold' }}>
                  <Link href={`/station/${r.slug}`} style={{ color: '#e8edf5', textDecoration: 'none' }}>
                    {r.station_name}駅
                  </Link>
                </td>
                <td style={{ padding: '10px 16px', color: '#aaa' }}>{r.line_name}</td>
                <td style={{ padding: '10px 16px', color: '#aaa' }}>{r.prefecture}</td>
                <td style={{ padding: '10px 16px' }}>
                  {r.passengers_2021 ? Number(r.passengers_2021).toLocaleString() + '人' : '-'}
                </td>
                <td style={{ padding: '10px 16px' }}>
                  <Link href={`/station/${r.slug}`} style={{ color: '#00d4aa', textDecoration: 'none', fontSize: '0.85rem', border: '1px solid #00d4aa', borderRadius: '4px', padding: '4px 10px' }}>
                    詳細
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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