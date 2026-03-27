import { neon } from '@neondatabase/serverless';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Breadcrumb from '@/components/Breadcrumb';

const sql = neon(process.env.DATABASE_URL!);

const VALID_KANA = ['あ', 'か', 'さ', 'た', 'な', 'は', 'ま', 'や', 'ら', 'わ', 'その他'] as const;
type Kana = (typeof VALID_KANA)[number];

function isValidKana(v: string): v is Kana {
  return (VALID_KANA as readonly string[]).includes(v);
}

function kanaLabel(kana: Kana): string {
  return kana === 'その他' ? 'その他' : `${kana}行`;
}

type Props = {
  params: Promise<{ kana: string; prefecture_slug: string }>;
};

async function getPrefectureName(prefSlug: string, kana: string): Promise<string | null> {
  const rows = await sql`
    SELECT DISTINCT s.prefecture_name
    FROM municipalities m
    LEFT JOIN stations s ON m.code5 = s.municipality_code
    WHERE m.municipality_name_initial_kana = ${kana}
      AND s.prefecture_slug = ${prefSlug}
      AND s.prefecture_name IS NOT NULL
    LIMIT 1
  `;
  return rows.length > 0 ? rows[0].prefecture_name : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { kana, prefecture_slug } = await params;
  const decoded = decodeURIComponent(kana);
  if (!isValidKana(decoded)) return {};

  const prefName = await getPrefectureName(prefecture_slug, decoded);
  if (!prefName) return {};

  const label = kanaLabel(decoded);
  return {
    title: `${prefName}の${label}の市区町村一覧・人口データ｜AreaScope`,
    description: `${prefName}の${label}で始まる市区町村を人口順で掲載しています。`,
  };
}

type MunicipalityRow = {
  municipality: string;
  prefecture_name: string;
  prefecture_slug: string;
  municipality_slug: string;
  population: number | null;
};

export default async function KanaPrefectureCityListPage({ params }: Props) {
  const { kana, prefecture_slug } = await params;
  const decoded = decodeURIComponent(kana);
  if (!isValidKana(decoded)) notFound();

  const prefName = await getPrefectureName(prefecture_slug, decoded);
  if (!prefName) notFound();

  const rows = (await sql`
    SELECT
      m.municipality,
      s.prefecture_name,
      s.prefecture_slug,
      s.municipality_slug,
      mp.population
    FROM municipalities m
    LEFT JOIN (
      SELECT DISTINCT ON (municipality_code)
        municipality_code,
        prefecture_name,
        prefecture_slug,
        municipality_slug
      FROM stations
      WHERE prefecture_slug IS NOT NULL
        AND municipality_slug IS NOT NULL
      ORDER BY municipality_code, station_name
    ) s ON s.municipality_code = m.code5
    LEFT JOIN municipality_populations mp
      ON mp.municipality_code = m.code5 AND mp.year = 2020
    WHERE m.municipality_name_initial_kana = ${decoded}
      AND s.prefecture_slug = ${prefecture_slug}
      AND s.municipality_slug IS NOT NULL
    ORDER BY mp.population DESC NULLS LAST, m.municipality
  `) as MunicipalityRow[];

  const label = kanaLabel(decoded);

  return (
    <main style={{ background: '#0a0e1a', minHeight: '100vh', color: '#e8edf5', padding: '2rem', fontFamily: 'sans-serif', maxWidth: '960px', margin: '0 auto' }}>
      <Breadcrumb
        items={[
          { label: 'TOP', href: '/' },
          { label: '市区町村一覧', href: '/city' },
          { label: `${label}の市区町村一覧`, href: `/city/list/${decoded}` },
          { label: prefName },
        ]}
      />

      <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>
        {prefName}の「{label}」の市区町村<span style={{ color: '#00d4aa' }}>一覧</span>
      </h1>
      <p style={{ color: '#aaa', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
        全{rows.length.toLocaleString()}市区町村
      </p>
      <p style={{ color: '#6b7a99', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
        ※{prefName}の「{label}」で始まる市区町村を2020年人口が多い順で掲載しています。
      </p>

      {/* かな行ナビ */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {VALID_KANA.map((k) => (
          <Link
            key={k}
            href={`/city/list/${k}/${prefecture_slug}`}
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

      <div style={{ background: '#111827', borderRadius: '8px', overflow: 'hidden', marginBottom: '1.5rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #1e2d45' }}>
              {['市区町村名', '都道府県', '人口（2020年）', ''].map((h) => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#aaa' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={`${r.prefecture_slug}-${r.municipality_slug}`} style={{ borderBottom: '1px solid #1e2d45' }}>
                <td style={{ padding: '10px 16px', fontWeight: 'bold' }}>
                  <Link href={`/city/${r.prefecture_slug}/${r.municipality_slug}`} style={{ color: '#e8edf5', textDecoration: 'none' }}>
                    {r.municipality}
                  </Link>
                </td>
                <td style={{ padding: '10px 16px', color: '#aaa' }}>{r.prefecture_name}</td>
                <td style={{ padding: '10px 16px' }}>
                  {r.population != null ? `${Number(r.population).toLocaleString()}人` : 'データなし'}
                </td>
                <td style={{ padding: '10px 16px' }}>
                  <Link href={`/city/${r.prefecture_slug}/${r.municipality_slug}`} style={{ color: '#00d4aa', textDecoration: 'none', fontSize: '0.85rem', border: '1px solid #00d4aa', borderRadius: '4px', padding: '4px 10px' }}>
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
