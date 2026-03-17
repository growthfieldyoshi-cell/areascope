import { neon } from '@neondatabase/serverless';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Breadcrumb from '@/components/Breadcrumb';

const sql = neon(process.env.DATABASE_URL!);
const BASE_URL = 'https://areascope.jp';

const LINE_MAP: Record<string, { display_name: string; line_name: string; operator_name: string }> = {
  yamanote: { display_name: '山手線', line_name: '山手線', operator_name: '東日本旅客鉄道' },
  chuo: { display_name: '中央線', line_name: '中央線', operator_name: '東日本旅客鉄道' },
  toyoko: { display_name: '東横線', line_name: '東横線', operator_name: '東急電鉄' },
  'keio-inokashira': { display_name: '京王井の頭線', line_name: '京王井の頭線', operator_name: '京王電鉄' },
  keio: { display_name: '京王線', line_name: '京王線', operator_name: '京王電鉄' },
  odakyu: { display_name: '小田急線', line_name: '小田急線', operator_name: '小田急電鉄' },
  tokaido: { display_name: '東海道線', line_name: '東海道線', operator_name: '東日本旅客鉄道' },
  sobu: { display_name: '総武線', line_name: '総武線', operator_name: '東日本旅客鉄道' },
  saikyo: { display_name: '埼京線', line_name: '埼京線', operator_name: '東日本旅客鉄道' },
  marunouchi: { display_name: '丸ノ内線', line_name: '4号線丸ノ内線', operator_name: '東京地下鉄' },
  hibiya: { display_name: '日比谷線', line_name: '2号線日比谷線', operator_name: '東京地下鉄' },
  ginza: { display_name: '銀座線', line_name: '3号線銀座線', operator_name: '東京地下鉄' },
  hanzomon: { display_name: '半蔵門線', line_name: '11号線半蔵門線', operator_name: '東京地下鉄' },
  fukutoshin: { display_name: '副都心線', line_name: '13号線副都心線', operator_name: '東京地下鉄' },
  namboku: { display_name: '南北線', line_name: '7号線南北線', operator_name: '東京地下鉄' },
  chiyoda: { display_name: '千代田線', line_name: '9号線千代田線', operator_name: '東京地下鉄' },
  yurakucho: { display_name: '有楽町線', line_name: '8号線有楽町線', operator_name: '東京地下鉄' },
  tozai: { display_name: '東西線', line_name: '5号線東西線', operator_name: '東京地下鉄' },
  mita: { display_name: '三田線', line_name: '6号線三田線', operator_name: '東京都' },
  shinjuku: { display_name: '新宿線', line_name: '10号線新宿線', operator_name: '東京都' },
  asakusa: { display_name: '浅草線', line_name: '1号線浅草線', operator_name: '東京都' },
  oedo: { display_name: '大江戸線', line_name: '12号線大江戸線', operator_name: '東京都' },
};

type Props = { params: Promise<{ slug: string }> };

type LineRankingRow = {
  station_name: string;
  prefecture_name: string;
  municipality_name: string;
  station_group_slug: string;
  passengers: number | null;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const line = LINE_MAP[slug];
  if (!line) return { title: '路線が見つかりません｜AreaScope' };

  return {
    title: `${line.display_name}の駅ランキング【2021年】｜AreaScope`,
    description: `${line.display_name}の駅を2021年乗降者数順にランキング。沿線駅の利用者数を比較できます。`,
    alternates: { canonical: `${BASE_URL}/line/${slug}/ranking` },
    robots: { index: true, follow: true },
  };
}

export default async function LineRankingPage({ params }: Props) {
  const { slug } = await params;
  const line = LINE_MAP[slug];
  if (!line) notFound();

  const rows = (await sql`
    WITH target_stations AS (
      SELECT
        s.station_key,
        s.station_name,
        s.prefecture_name,
        s.municipality_name,
        s.station_group_slug
      FROM stations s
      WHERE s.line_name = ${line.line_name}
        AND s.operator_name = ${line.operator_name}
        AND s.station_group_slug IS NOT NULL
    ),
    grouped AS (
      SELECT DISTINCT ON (ts.station_group_slug)
        ts.station_name,
        ts.prefecture_name,
        ts.municipality_name,
        ts.station_group_slug
      FROM target_stations ts
      ORDER BY ts.station_group_slug, ts.station_name
    ),
    passengers_by_group AS (
      SELECT
        ts.station_group_slug,
        CAST(SUM(sp.passengers) AS bigint) AS passengers
      FROM target_stations ts
      LEFT JOIN station_passengers sp
        ON sp.station_key = ts.station_key
        AND sp.year = 2021
      GROUP BY ts.station_group_slug
    )
    SELECT
      g.station_name,
      g.prefecture_name,
      g.municipality_name,
      g.station_group_slug,
      p.passengers
    FROM grouped g
    LEFT JOIN passengers_by_group p
      ON g.station_group_slug = p.station_group_slug
    ORDER BY p.passengers DESC NULLS LAST, g.station_name ASC
    LIMIT 50
  `) as LineRankingRow[];

  if (rows.length === 0) notFound();

  return (
    <main style={{ background: '#0a0e1a', minHeight: '100vh', color: '#e8edf5', padding: '2rem', fontFamily: 'sans-serif', maxWidth: '960px', margin: '0 auto' }}>
      <style>{`
        .ranking-cards { display: none; }
        .ranking-card { background: #111827; border: 1px solid #1e2d45; border-radius: 8px; padding: 14px 16px; margin-bottom: 10px; display: flex; align-items: center; gap: 16px; }
        .ranking-card-rank { font-family: monospace; font-size: 18px; font-weight: 700; color: #6b7a99; min-width: 36px; text-align: center; }
        .ranking-card-rank.top3 { color: #00d4aa; }
        .ranking-card-body { flex: 1; }
        .ranking-card-name { font-size: 15px; font-weight: 700; margin-bottom: 4px; }
        .ranking-card-meta { font-size: 12px; color: #aaa; margin-bottom: 4px; }
        .ranking-card-passengers { font-size: 13px; color: #00d4aa; font-family: monospace; }
        .ranking-card-btn { color: #00d4aa; text-decoration: none; font-size: 12px; border: 1px solid #00d4aa; border-radius: 4px; padding: 4px 10px; white-space: nowrap; }
        @media (max-width: 640px) {
          .ranking-table-wrap { display: none; }
          .ranking-cards { display: block; }
        }
      `}</style>

      <Breadcrumb items={[
        { label: 'TOP', href: '/' },
        { label: '路線一覧', href: '/line' },
        { label: line.display_name, href: `/line/${slug}` },
        { label: 'ランキング' },
      ]} />

      <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>
        {line.display_name}<span style={{ color: '#00d4aa' }}>沿線駅ランキング</span>
      </h1>
      <p style={{ color: '#aaa', marginBottom: '8px', fontSize: '0.95rem', lineHeight: 1.8 }}>
        2021年の乗降者数データをもとに、{line.display_name}の駅を利用者数順に掲載しています。
      </p>
      <p style={{ color: '#6b7a99', marginBottom: '2rem', fontSize: '12px', fontFamily: 'monospace' }}>
        ※ 上位{rows.length}駅を掲載
      </p>

      <div className="ranking-table-wrap" style={{ background: '#111827', borderRadius: '8px', overflow: 'hidden', marginBottom: '2rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #1e2d45' }}>
              {['順位', '駅名', '所在地', '乗降者数（2021年）', ''].map((h) => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: '#aaa' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.station_group_slug} style={{ borderBottom: '1px solid #1e2d45' }}>
                <td style={{ padding: '10px 16px', color: i < 3 ? '#00d4aa' : '#aaa', fontWeight: i < 3 ? 'bold' : 'normal' }}>{i + 1}位</td>
                <td style={{ padding: '10px 16px', fontWeight: 'bold' }}>
                  <Link href={`/station/${r.station_group_slug}`} style={{ color: '#e8edf5', textDecoration: 'none' }}>{r.station_name}駅</Link>
                </td>
                <td style={{ padding: '10px 16px', color: '#aaa' }}>{r.prefecture_name}{r.municipality_name}</td>
                <td style={{ padding: '10px 16px' }}>{r.passengers != null ? `${Number(r.passengers).toLocaleString()}人` : 'データなし'}</td>
                <td style={{ padding: '10px 16px' }}>
                  <Link href={`/station/${r.station_group_slug}`} style={{ color: '#00d4aa', textDecoration: 'none', fontSize: '0.85rem', border: '1px solid #00d4aa', borderRadius: '4px', padding: '4px 10px' }}>詳細</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="ranking-cards" style={{ marginBottom: '2rem' }}>
        {rows.map((r, i) => (
          <div key={r.station_group_slug} className="ranking-card">
            <div className={`ranking-card-rank ${i < 3 ? 'top3' : ''}`}>{i + 1}</div>
            <div className="ranking-card-body">
              <div className="ranking-card-name">
                <Link href={`/station/${r.station_group_slug}`} style={{ textDecoration: 'none', color: '#e8edf5' }}>{r.station_name}駅</Link>
              </div>
              <div className="ranking-card-meta">{r.prefecture_name}{r.municipality_name}</div>
              <div className="ranking-card-passengers">
                {r.passengers != null ? `${Number(r.passengers).toLocaleString()}人` : 'データなし'}
              </div>
            </div>
            <Link href={`/station/${r.station_group_slug}`} className="ranking-card-btn">詳細</Link>
          </div>
        ))}
      </div>

      <section>
        <Link href={`/line/${slug}`} style={{ color: '#00d4aa', textDecoration: 'none', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', fontSize: '0.9rem', display: 'inline-block' }}>
          🚃 {line.display_name}の駅一覧を見る
        </Link>
      </section>
    </main>
  );
}