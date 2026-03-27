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
    sql`
      SELECT COUNT(DISTINCT station_group_slug) as cnt
      FROM stations
      WHERE station_group_slug IS NOT NULL
    `,
  ]) as [StationRow[], { cnt: number }[]];

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

      <section style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1rem', color: '#00d4aa', marginBottom: '0.5rem' }}>
          かな別一覧
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {['あ','か','さ','た','な','は','ま','や','ら','わ','その他'].map((kana) => (
            <Link
              key={kana}
              href={`/station/list/${encodeURIComponent(kana)}`}
              style={{ color: '#00d4aa', textDecoration: 'none', border: '1px solid #00d4aa', borderRadius: '4px', padding: '4px 10px', fontSize: '0.85rem' }}
            >
              {kana === 'その他' ? 'その他' : `${kana}行`}
            </Link>
          ))}
        </div>
      </section>

      <div style={{ background: '#111827', borderRadius: '8px', overflow: 'hidden', marginBottom: '1.5rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #1e2d45' }}>
              {['駅名', '都道府県', '自治体', '2021年乗降者数', ''].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#aaa' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.station_group_slug} style={{ borderBottom: '1px solid #1e2d45' }}>
                <td style={{ padding: '10px 16px', fontWeight: 'bold' }}>
                  <Link href={`/station/${r.station_group_slug}`} style={{ color: '#e8edf5', textDecoration: 'none' }}>
                    {r.station_name}駅
                  </Link>
                </td>
                <td style={{ padding: '10px 16px', color: '#aaa' }}>{r.prefecture_name}</td>
                <td style={{ padding: '10px 16px', color: '#aaa' }}>{r.municipality_name}</td>
                <td style={{ padding: '10px 16px' }}>
                  {r.passengers != null ? `${Number(r.passengers).toLocaleString()}人` : 'データなし'}
                </td>
                <td style={{ padding: '10px 16px' }}>
                  <Link href={`/station/${r.station_group_slug}`} style={{ color: '#00d4aa', textDecoration: 'none', fontSize: '0.85rem', border: '1px solid #00d4aa', borderRadius: '4px', padding: '4px 10px' }}>
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

      <div style={{ borderTop: '1px solid #1e2d45', marginTop: '2rem', paddingTop: '2rem' }}>
        <h2 style={{ fontSize: '1rem', color: '#00d4aa', marginBottom: '0.5rem' }}>駅名クイズに挑戦</h2>
        <p style={{ color: '#aaa', fontSize: '0.85rem', marginBottom: '1rem' }}>
          難読駅名や路線・都道府県など、駅データをクイズ形式で楽しめます。
        </p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Link href="/quiz" style={{ color: '#e8edf5', textDecoration: 'none', background: '#111827', border: '1px solid #1e2d45', borderRadius: '6px', padding: '8px 16px', fontSize: '0.85rem' }}>クイズ一覧を見る</Link>
          <Link href="/station/quiz" style={{ color: '#e8edf5', textDecoration: 'none', background: '#111827', border: '1px solid #1e2d45', borderRadius: '6px', padding: '8px 16px', fontSize: '0.85rem' }}>難読駅名クイズ</Link>
          <Link href="/station/hard-reading" style={{ color: '#e8edf5', textDecoration: 'none', background: '#111827', border: '1px solid #1e2d45', borderRadius: '6px', padding: '8px 16px', fontSize: '0.85rem' }}>難読駅名一覧</Link>
        </div>
      </div>
    </main>
  );
}