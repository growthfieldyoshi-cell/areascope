import { neon } from '@neondatabase/serverless';
import Link from 'next/link';
import type { Metadata } from 'next';
import Breadcrumb from '@/components/Breadcrumb';

const sql = neon(process.env.DATABASE_URL!);

export const metadata: Metadata = {
  title: '市区町村一覧｜AreaScope',
  description: '全国の市区町村一覧を都道府県別に掲載。各市区町村の駅一覧・人口推移を確認できます。',
};

type MunicipalityRow = {
  prefecture_slug: string;
  prefecture_name: string;
  municipality_slug: string;
  municipality_name: string;
};

export default async function CityListPage() {
  const rows = (await sql`
    SELECT DISTINCT
      prefecture_slug,
      prefecture_name,
      municipality_slug,
      municipality_name
    FROM stations
    WHERE prefecture_slug IS NOT NULL
      AND municipality_slug IS NOT NULL
      AND station_group_slug IS NOT NULL
    ORDER BY prefecture_slug, municipality_name
  `) as MunicipalityRow[];

  const grouped = rows.reduce<Record<string, { prefecture_name: string; municipalities: MunicipalityRow[] }>>(
    (acc, row) => {
      if (!acc[row.prefecture_slug]) {
        acc[row.prefecture_slug] = {
          prefecture_name: row.prefecture_name,
          municipalities: [],
        };
      }
      acc[row.prefecture_slug].municipalities.push(row);
      return acc;
    },
    {}
  );

  const PREF_ORDER = [
    'hokkaido','aomori','iwate','miyagi','akita','yamagata','fukushima',
    'ibaraki','tochigi','gunma','saitama','chiba','tokyo','kanagawa',
    'niigata','toyama','ishikawa','fukui','yamanashi','nagano',
    'gifu','shizuoka','aichi','mie','shiga','kyoto','osaka','hyogo',
    'nara','wakayama','tottori','shimane','okayama','hiroshima','yamaguchi',
    'tokushima','kagawa','ehime','kochi','fukuoka','saga','nagasaki',
    'kumamoto','oita','miyazaki','kagoshima','okinawa',
  ];

  const sortedPrefs = PREF_ORDER.filter(slug => grouped[slug]);

  return (
    <main style={{ background: '#0a0e1a', minHeight: '100vh', color: '#e8edf5', padding: '2rem', fontFamily: 'sans-serif', maxWidth: '960px', margin: '0 auto' }}>
      <Breadcrumb items={[
        { label: 'TOP', href: '/' },
        { label: '市区町村一覧' },
      ]} />

      <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>
        市区町村<span style={{ color: '#00d4aa' }}>一覧</span>
      </h1>
      <p style={{ color: '#aaa', marginBottom: '2rem', fontSize: '0.95rem', lineHeight: 1.8 }}>
        全国の市区町村を都道府県別に掲載しています。各市区町村ページでは駅一覧・人口推移を確認できます。
      </p>

      {sortedPrefs.map((prefSlug) => {
        const { prefecture_name, municipalities } = grouped[prefSlug];
        return (
          <section key={prefSlug} style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid #1e2d45' }}>
              <Link href={`/prefecture/${prefSlug}`} style={{ color: '#00d4aa', textDecoration: 'none' }}>
                {prefecture_name}
              </Link>
              <span style={{ color: '#6b7a99', fontSize: '0.85rem', marginLeft: '8px' }}>
                {municipalities.length}市区町村
              </span>
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {municipalities.map((m) => (
                <Link
                  key={m.municipality_slug}
                  href={`/city/${prefSlug}/${m.municipality_slug}`}
                  style={{
                    color: '#e8edf5',
                    textDecoration: 'none',
                    background: '#111827',
                    border: '1px solid #1e2d45',
                    borderRadius: '4px',
                    padding: '4px 12px',
                    fontSize: '0.85rem',
                  }}
                >
                  {m.municipality_name}
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </main>
  );
}