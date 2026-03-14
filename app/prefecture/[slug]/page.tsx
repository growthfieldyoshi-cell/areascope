import { neon } from '@neondatabase/serverless';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Breadcrumb from '@/components/Breadcrumb';

const sql = neon(process.env.DATABASE_URL!);

const BASE_URL = 'https://areascope.jp';
const OG_IMAGE = 'https://areascope.jp/og-default.jpg';

const PREF_MAP: Record<string, string> = {
  hokkaido: '北海道', aomori: '青森県', iwate: '岩手県', miyagi: '宮城県',
  akita: '秋田県', yamagata: '山形県', fukushima: '福島県', ibaraki: '茨城県',
  tochigi: '栃木県', gunma: '群馬県', saitama: '埼玉県', chiba: '千葉県',
  tokyo: '東京都', kanagawa: '神奈川県', niigata: '新潟県', toyama: '富山県',
  ishikawa: '石川県', fukui: '福井県', yamanashi: '山梨県', nagano: '長野県',
  gifu: '岐阜県', shizuoka: '静岡県', aichi: '愛知県', mie: '三重県',
  shiga: '滋賀県', kyoto: '京都府', osaka: '大阪府', hyogo: '兵庫県',
  nara: '奈良県', wakayama: '和歌山県', tottori: '鳥取県', shimane: '島根県',
  okayama: '岡山県', hiroshima: '広島県', yamaguchi: '山口県', tokushima: '徳島県',
  kagawa: '香川県', ehime: '愛媛県', kochi: '高知県', fukuoka: '福岡県',
  saga: '佐賀県', nagasaki: '長崎県', kumamoto: '熊本県', oita: '大分県',
  miyazaki: '宮崎県', kagoshima: '鹿児島県', okinawa: '沖縄県',
};

type Props = { params: Promise<{ slug: string }> };

type PrefectureStationRow = {
  station_name: string;
  station_group_slug: string;
  municipality_name: string;
  municipality_slug: string;
  passengers: number | null;
  population: number | null;
};

export async function generateStaticParams() {
  return Object.keys(PREF_MAP).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const prefName = PREF_MAP[slug];
  if (!prefName) return { title: '都道府県が見つかりません｜AreaScope', robots: { index: false, follow: false } };
  const title = `${prefName}の駅一覧｜AreaScope`;
  const description = `${prefName}の駅一覧を掲載。乗降者数・自治体人口データとあわせて、エリア分析に活用できます。`;
  return {
    title, description,
    alternates: { canonical: `${BASE_URL}/prefecture/${slug}` },
    openGraph: { type: 'website', title, description, url: `${BASE_URL}/prefecture/${slug}`, siteName: 'AreaScope', images: [{ url: OG_IMAGE }] },
    twitter: { card: 'summary_large_image', title, description, images: [OG_IMAGE] },
    robots: { index: true, follow: true },
  };
}

export default async function PrefecturePage({ params }: Props) {
  const { slug } = await params;
  const prefName = PREF_MAP[slug];
  if (!prefName) notFound();

  const stations = (await sql`
    WITH grouped AS (
      SELECT DISTINCT ON (s.station_group_slug)
        s.station_name,
        s.station_group_slug,
        s.municipality_name,
        s.municipality_slug,
        s.municipality_code
      FROM stations s
      WHERE s.prefecture_name = ${prefName}
        AND s.station_group_slug IS NOT NULL
      ORDER BY s.station_group_slug, s.station_name
    )
    SELECT
      g.station_name,
      g.station_group_slug,
      g.municipality_name,
      g.municipality_slug,
      CAST(SUM(sp.passengers) AS bigint) AS passengers,
      MAX(mp.population) AS population
    FROM grouped g
    LEFT JOIN stations s
      ON s.station_group_slug = g.station_group_slug
      AND s.prefecture_name = ${prefName}
    LEFT JOIN station_passengers sp ON sp.station_key = s.station_key AND sp.year = 2021
    LEFT JOIN municipality_populations mp ON mp.municipality_code = g.municipality_code AND mp.year = 2020
    GROUP BY g.station_name, g.station_group_slug, g.municipality_name, g.municipality_slug
    ORDER BY passengers DESC NULLS LAST, g.station_name ASC
  `) as PrefectureStationRow[];

  if (stations.length === 0) notFound();

  const top20 = stations.slice(0, 20);

  return (
    <main style={{ background: '#0a0e1a', minHeight: '100vh', color: '#e8edf5', padding: '2rem', fontFamily: 'sans-serif', maxWidth: '960px', margin: '0 auto' }}>
      <style>{`
        .pref-table-wrap { overflow-x: auto; }
        .pref-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
        .pref-table th { padding: 10px 16px; text-align: left; color: #aaa; }
        .pref-table td { padding: 10px 16px; border-bottom: 1px solid #1e2d45; }
        .pref-cards { display: none; }
        .pref-card { background: #111827; border: 1px solid #1e2d45; border-radius: 8px; padding: 14px 16px; margin-bottom: 10px; }
        .pref-card-top { display: flex; align-items: center; gap: 12px; margin-bottom: 6px; }
        .pref-card-rank { font-family: monospace; font-size: 13px; color: #6b7a99; min-width: 32px; }
        .pref-card-rank.top3 { color: #00d4aa; font-weight: bold; }
        .pref-card-name { font-size: 15px; font-weight: 700; flex: 1; }
        .pref-card-btn { color: #00d4aa; text-decoration: none; font-size: 12px; border: 1px solid #00d4aa; border-radius: 4px; padding: 4px 10px; white-space: nowrap; }
        .pref-card-meta { font-size: 12px; color: #aaa; display: flex; gap: 16px; flex-wrap: wrap; }
        @media (max-width: 640px) {
          .pref-table-wrap { display: none; }
          .pref-cards { display: block; }
        }
      `}</style>

      <Breadcrumb items={[
        { label: 'TOP', href: '/' },
        { label: prefName },
      ]} />

      <h1 style={{ fontSize: '1.8rem', color: '#00d4aa', marginBottom: '0.75rem' }}>{prefName}の駅一覧</h1>
      <p style={{ color: '#aaa', marginBottom: '0.75rem', lineHeight: '1.9', fontSize: '0.95rem' }}>
        {prefName}内の全{stations.length}駅を掲載しています。乗降者数（2021年）をもとに並べています。
      </p>
      <p style={{ color: '#aaa', marginBottom: '0.5rem', fontSize: '0.9rem' }}>都道府県内の主要駅を確認したい場合に使えるページです。</p>
      <p style={{ color: '#6b7a99', marginBottom: '2rem', fontSize: '0.85rem' }}>※ 一部の駅は2021年乗降者数データが未掲載のため「データなし」と表示しています。</p>

      {/* 上位20駅 */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.3rem', color: '#00d4aa', marginBottom: '0.5rem' }}>{prefName} 乗降者数上位20駅</h2>
        <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '1rem' }}>2021年の乗降者数が多い順に表示しています。</p>

        {/* PC */}
        <div className="pref-table-wrap" style={{ background: '#111827', borderRadius: '8px', overflow: 'hidden' }}>
          <table className="pref-table">
            <thead>
              <tr style={{ borderBottom: '2px solid #1e2d45' }}>
                {['順位', '駅名', '自治体', '乗降者数（2021年）', '自治体人口（2020年）', ''].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {top20.map((r, i) => (
                <tr key={r.station_group_slug}>
                  <td style={{ color: i < 3 ? '#00d4aa' : '#aaa', fontWeight: i < 3 ? 'bold' : 'normal' }}>{i + 1}位</td>
                  <td style={{ fontWeight: 'bold' }}>
                    <Link href={`/station/${r.station_group_slug}`} style={{ color: '#e8edf5', textDecoration: 'none' }}>{r.station_name}駅</Link>
                  </td>
                  <td>
                    <Link href={`/city/${slug}/${r.municipality_slug}`} style={{ color: '#00d4aa', textDecoration: 'none' }}>{r.municipality_name}</Link>
                  </td>
                  <td>{r.passengers != null ? `${Number(r.passengers).toLocaleString()}人` : 'データなし'}</td>
                  <td style={{ color: '#aaa' }}>{r.population != null ? `${Number(r.population).toLocaleString()}人` : 'データなし'}</td>
                  <td>
                    <Link href={`/station/${r.station_group_slug}`} style={{ color: '#00d4aa', textDecoration: 'none', fontSize: '0.85rem', border: '1px solid #00d4aa', borderRadius: '4px', padding: '4px 10px' }}>詳細</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* スマホ */}
        <div className="pref-cards">
          {top20.map((r, i) => (
            <div key={r.station_group_slug} className="pref-card">
              <div className="pref-card-top">
                <div className={`pref-card-rank ${i < 3 ? 'top3' : ''}`}>{i + 1}位</div>
                <div className="pref-card-name">
                  <Link href={`/station/${r.station_group_slug}`} style={{ textDecoration: 'none', color: '#e8edf5' }}>{r.station_name}駅</Link>
                </div>
                <Link href={`/station/${r.station_group_slug}`} className="pref-card-btn">詳細</Link>
              </div>
              <div className="pref-card-meta">
                <span>
                  <Link href={`/city/${slug}/${r.municipality_slug}`} style={{ color: '#00d4aa', textDecoration: 'none' }}>{r.municipality_name}</Link>
                </span>
                <span>乗降者数: {r.passengers != null ? `${Number(r.passengers).toLocaleString()}人` : 'データなし'}</span>
                <span>人口: {r.population != null ? `${Number(r.population).toLocaleString()}人` : 'データなし'}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 全駅一覧 */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.3rem', color: '#00d4aa', marginBottom: '0.5rem' }}>{prefName}の駅一覧（全{stations.length}駅）</h2>
        <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '1rem' }}>乗降者数（2021年）の多い順に表示しています。</p>

        {/* PC */}
        <div className="pref-table-wrap" style={{ background: '#111827', borderRadius: '8px', overflow: 'hidden' }}>
          <table className="pref-table">
            <thead>
              <tr style={{ borderBottom: '2px solid #1e2d45' }}>
                {['駅名', '自治体', '乗降者数（2021年）', '自治体人口（2020年）', ''].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stations.map((r) => (
                <tr key={r.station_group_slug}>
                  <td style={{ fontWeight: 'bold' }}>
                    <Link href={`/station/${r.station_group_slug}`} style={{ color: '#e8edf5', textDecoration: 'none' }}>{r.station_name}駅</Link>
                  </td>
                  <td>
                    <Link href={`/city/${slug}/${r.municipality_slug}`} style={{ color: '#00d4aa', textDecoration: 'none' }}>{r.municipality_name}</Link>
                  </td>
                  <td>{r.passengers != null ? `${Number(r.passengers).toLocaleString()}人` : 'データなし'}</td>
                  <td style={{ color: '#aaa' }}>{r.population != null ? `${Number(r.population).toLocaleString()}人` : 'データなし'}</td>
                  <td>
                    <Link href={`/station/${r.station_group_slug}`} style={{ color: '#00d4aa', textDecoration: 'none', fontSize: '0.85rem', border: '1px solid #00d4aa', borderRadius: '4px', padding: '4px 10px' }}>詳細</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* スマホ */}
        <div className="pref-cards">
          {stations.map((r) => (
            <div key={r.station_group_slug} className="pref-card">
              <div className="pref-card-top">
                <div className="pref-card-name">
                  <Link href={`/station/${r.station_group_slug}`} style={{ textDecoration: 'none', color: '#e8edf5' }}>{r.station_name}駅</Link>
                </div>
                <Link href={`/station/${r.station_group_slug}`} className="pref-card-btn">詳細</Link>
              </div>
              <div className="pref-card-meta">
                <span>
                  <Link href={`/city/${slug}/${r.municipality_slug}`} style={{ color: '#00d4aa', textDecoration: 'none' }}>{r.municipality_name}</Link>
                </span>
                <span>乗降者数: {r.passengers != null ? `${Number(r.passengers).toLocaleString()}人` : 'データなし'}</span>
                <span>人口: {r.population != null ? `${Number(r.population).toLocaleString()}人` : 'データなし'}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: '1.3rem', color: '#00d4aa', marginBottom: '0.5rem' }}>ほかの駅データを見る</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/station-ranking" style={{ color: '#00d4aa', textDecoration: 'none', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', fontSize: '0.9rem' }}>🏆 全国駅ランキング</Link>
          <Link href="/line" style={{ color: '#00d4aa', textDecoration: 'none', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', fontSize: '0.9rem' }}>🚃 路線一覧</Link>
        </div>
      </section>
    </main>
  );
}