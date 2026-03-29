import { neon } from '@neondatabase/serverless';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Breadcrumb from '@/components/Breadcrumb';

const sql = neon(process.env.DATABASE_URL!);

async function getLatestYear(): Promise<number> {
  const rows = await sql`SELECT MAX(year) AS year FROM station_passengers`;
  return rows[0]?.year ?? 2021;
}

const VALID_KANA = ['あ', 'か', 'さ', 'た', 'な', 'は', 'ま', 'や', 'ら', 'わ', 'その他'] as const;
type Kana = (typeof VALID_KANA)[number];

function isValidKana(v: string): v is Kana {
  return (VALID_KANA as readonly string[]).includes(v);
}

function kanaLabel(kana: Kana): string {
  return kana === 'その他' ? 'その他' : `${kana}行`;
}

type Props = {
  params: Promise<{ kana: string }>;
};

export function generateStaticParams() {
  return VALID_KANA.map((kana) => ({ kana }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { kana } = await params;
  const decoded = decodeURIComponent(kana);
  if (!isValidKana(decoded)) return {};

  const label = kanaLabel(decoded);
  const year = await getLatestYear();
  return {
    title: `「${label}」の駅一覧・乗降者数データ｜AreaScope`,
    description: `「${label}」で始まる全国の駅一覧です。${year}年乗降者数データとともに各駅の詳細を確認できます。`,
  };
}

type PrefRow = {
  prefecture_slug: string;
  prefecture_name: string;
};

type StationRow = {
  station_name: string;
  prefecture_name: string;
  municipality_name: string;
  station_group_slug: string;
  passengers: number | null;
};

export default async function KanaStationListPage({ params }: Props) {
  const { kana } = await params;
  const decoded = decodeURIComponent(kana);
  if (!isValidKana(decoded)) notFound();

  const year = await getLatestYear();

  const [rows, prefRows] = await Promise.all([
    sql`
    WITH grouped AS (
      SELECT DISTINCT ON (s.station_group_slug)
        s.station_name,
        s.prefecture_name,
        s.municipality_name,
        s.station_group_slug
      FROM stations s
      WHERE s.station_group_slug IS NOT NULL
        AND s.station_name_initial_kana = ${decoded}
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
    LEFT JOIN station_passengers sp ON sp.station_key = s.station_key AND sp.year = ${year}
    GROUP BY g.station_name, g.prefecture_name, g.municipality_name, g.station_group_slug
    ORDER BY passengers DESC NULLS LAST
  `,
    sql`
    SELECT DISTINCT prefecture_slug, prefecture_name
    FROM stations
    WHERE station_name_initial_kana = ${decoded}
      AND prefecture_slug IS NOT NULL
      AND prefecture_name IS NOT NULL
    ORDER BY prefecture_name
  `,
  ]) as [StationRow[], PrefRow[]];

  const label = kanaLabel(decoded);

  return (
    <main style={{ background: '#0a0e1a', minHeight: '100vh', color: '#e8edf5', padding: '2rem', fontFamily: 'sans-serif', maxWidth: '960px', margin: '0 auto' }}>
      <Breadcrumb
        items={[
          { label: 'トップ', href: '/' },
          { label: '駅一覧', href: '/station/list' },
          { label: `${label}の駅一覧` },
        ]}
      />

      <h1 style={{ fontSize: '1.8rem', color: '#00d4aa', marginBottom: '0.5rem' }}>
        「{label}」の駅一覧
      </h1>
      <p style={{ color: '#aaa', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
        全{rows.length.toLocaleString()}駅
      </p>
      <p style={{ color: '#6b7a99', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
        ※駅名は「{label}」で絞り込み、掲載順は{year}年乗降者数が多い順です。
      </p>

      {/* かな行ナビ */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {VALID_KANA.map((k) => (
          <Link
            key={k}
            href={`/station/list/${k}`}
            style={{
              color: k === decoded ? '#0a0e1a' : '#00d4aa',
              background: k === decoded ? '#00d4aa' : 'transparent',
              border: '1px solid #00d4aa',
              borderRadius: '4px',
              padding: '4px 10px',
              textDecoration: 'none',
              fontSize: '0.85rem',
            }}
          >
            {k === 'その他' ? '他' : k}
          </Link>
        ))}
      </div>

      {/* 都道府県ナビ */}
      {prefRows.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ color: '#aaa', fontSize: '0.8rem', marginBottom: '6px' }}>都道府県で絞り込む：</p>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {prefRows.map((p) => (
              <Link
                key={p.prefecture_slug}
                href={`/station/list/${decoded}/${p.prefecture_slug}`}
                style={{
                  color: '#00d4aa',
                  border: '1px solid #1e2d45',
                  borderRadius: '4px',
                  padding: '4px 10px',
                  textDecoration: 'none',
                  fontSize: '0.8rem',
                }}
              >
                {p.prefecture_name}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div style={{ background: '#111827', borderRadius: '8px', overflow: 'hidden', marginBottom: '1.5rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #1e2d45' }}>
              {['駅名', '都道府県', '自治体', `${year}年乗降者数`, ''].map((h) => (
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
    </main>
  );
}
