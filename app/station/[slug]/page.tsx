import { neon } from '@neondatabase/serverless';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';

const sql = neon(process.env.DATABASE_URL!);
const BASE_URL = 'https://areascope.jp';

type PageProps = {
  params: Promise<{ slug: string }>;
};

type StationInfo = {
  station_name: string;
  prefecture_name: string;
  prefecture_slug: string;
  municipality_name: string;
  municipality_slug: string;
  municipality_code: string;
  line_names: string;
  operator_names: string;
  line_slug: string | null;
};

type PopulationRow = {
  year: number;
  population: number;
};

type PassengerRow = {
  year: number;
  passengers: number;
};

type SameLineStation = {
  station_group_slug: string;
  station_name: string;
  passengers: number | null;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const rows = await sql`
    SELECT station_name, prefecture_name, municipality_name
    FROM stations
    WHERE station_group_slug = ${slug}
    LIMIT 1
  `;
  const station = rows[0];
  if (!station) return { title: '駅が見つかりません｜AreaScope' };
  const title = `${station.station_name}駅の乗降者数・年別推移｜全国ランキング【最新】`;
  const description = `${station.station_name}駅の乗降者数を掲載。年別推移グラフ・全国ランキング・周辺駅との比較が一目でわかります。`;
  return {
    title,
    description,
    alternates: { canonical: `${BASE_URL}/station/${slug}` },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/station/${slug}`,
      siteName: 'AreaScope',
      type: 'article',
    },
  };
}

export default async function StationPage({ params }: PageProps) {
  const { slug } = await params;

  // slug逆引き：station_group_slug または slug で検索し、slugヒット時はリダイレクト
  const lookupRows = await sql`
    SELECT station_group_slug,
           CASE
             WHEN station_group_slug = ${slug} THEN 'group'
             WHEN slug = ${slug} THEN 'slug'
           END AS matched_by
    FROM stations
    WHERE station_group_slug = ${slug}
       OR slug = ${slug}
    LIMIT 1
  `;
  if (lookupRows.length === 0) notFound();
  if (lookupRows[0].matched_by === 'slug') {
    permanentRedirect(`/station/${lookupRows[0].station_group_slug}`);
  }

  const infoRows = await sql`
    SELECT
      s.station_name,
      s.prefecture_name,
      s.prefecture_slug,
      s.municipality_name,
      s.municipality_slug,
      s.municipality_code,
      MAX(s.line_slug) FILTER (WHERE s.line_slug IS NOT NULL) AS line_slug,
      STRING_AGG(DISTINCT s.line_name, '・' ORDER BY s.line_name) AS line_names,
      STRING_AGG(DISTINCT s.operator_name, '・' ORDER BY s.operator_name) AS operator_names
    FROM stations s
    WHERE s.station_group_slug = ${slug}
    GROUP BY
      s.station_name, s.prefecture_name, s.prefecture_slug,
      s.municipality_name, s.municipality_slug, s.municipality_code
    LIMIT 1
  `;

  const station = infoRows[0] as StationInfo | undefined;
  if (!station) notFound();

  const populationRows = (await sql`
    SELECT year, population
    FROM municipality_populations
    WHERE municipality_code = ${station.municipality_code}
    ORDER BY year ASC
  `) as PopulationRow[];

  const passengerRows = (await sql`
    SELECT sp.year, CAST(SUM(sp.passengers) AS bigint) AS passengers
    FROM station_passengers sp
    JOIN stations s ON s.station_key = sp.station_key
    WHERE s.station_group_slug = ${slug}
    GROUP BY sp.year
    ORDER BY sp.year ASC
  `) as PassengerRow[];

  const latestYear = passengerRows.length > 0 ? passengerRows[passengerRows.length - 1].year : 2021;

  const sameLineStations = (await sql`
    WITH related_station_groups AS (
      SELECT DISTINCT s2.station_group_slug
      FROM stations s1
      JOIN stations s2
        ON s1.line_name = s2.line_name
       AND s1.operator_name = s2.operator_name
      WHERE s1.station_group_slug = ${slug}
        AND s2.station_group_slug IS NOT NULL
        AND s2.station_group_slug != ${slug}
        AND s1.line_name NOT LIKE '%新幹線%'
    ),
    grouped_passengers AS (
      SELECT
        s.station_group_slug,
        MAX(s.station_name) AS station_name,
        CAST(SUM(sp.passengers) AS bigint) AS passengers
      FROM stations s
      LEFT JOIN station_passengers sp
        ON s.station_key = sp.station_key
       AND sp.year = ${latestYear}
      WHERE s.station_group_slug IN (
        SELECT station_group_slug FROM related_station_groups
      )
      GROUP BY s.station_group_slug
    )
    SELECT station_group_slug, station_name, passengers
    FROM grouped_passengers
    WHERE passengers IS NOT NULL
    ORDER BY passengers DESC NULLS LAST
    LIMIT 8
  `) as SameLineStation[];

  const maxPop = populationRows.length > 0 ? Math.max(...populationRows.map(r => r.population)) : 1;
  const maxPass = passengerRows.length > 0 ? Math.max(...passengerRows.map(r => r.passengers)) : 1;
  const latestPass = passengerRows.length > 0 ? passengerRows[passengerRows.length - 1] : null;
  const latestPop = populationRows.length > 0 ? populationRows[populationRows.length - 1] : null;
  const oldestPop = populationRows.length > 0 ? populationRows[0] : null;
  const changeRate = latestPop && oldestPop && oldestPop.population > 0
    ? (((latestPop.population - oldestPop.population) / oldestPop.population) * 100).toFixed(1)
    : null;

  return (
    <main style={{ background: '#0a0e1a', minHeight: '100vh', color: '#e8edf5', fontFamily: "'Noto Sans JP', sans-serif" }}>
      <style>{`
        .kpi { background: #111827; border: 1px solid #1e2d45; border-radius: 12px; padding: 16px 20px; }
        @media (max-width: 640px) {
          .kpi-grid { grid-template-columns: 1fr 1fr !important; }
          .content { padding: 24px 16px !important; }
        }
      `}</style>

      <header style={{ padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1e2d45', background: 'rgba(10,14,26,0.95)' }}>
        <Link href="/" style={{ fontSize: '22px', fontWeight: 800, textDecoration: 'none', color: '#e8edf5' }}>
          AREA<span style={{ color: '#00d4aa' }}>SCOPE</span>
        </Link>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link href="/station-ranking" style={{ fontFamily: 'monospace', fontSize: '12px', color: '#6b7a99', background: '#111827', border: '1px solid #1e2d45', padding: '6px 12px', borderRadius: '6px', textDecoration: 'none' }}>🏆 ランキング</Link>
          <Link href="/line" style={{ fontFamily: 'monospace', fontSize: '12px', color: '#6b7a99', background: '#111827', border: '1px solid #1e2d45', padding: '6px 12px', borderRadius: '6px', textDecoration: 'none' }}>🗺️ 路線</Link>
        </div>
      </header>

      <div className="content" style={{ maxWidth: '960px', margin: '0 auto', padding: '40px 20px' }}>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'トップ', item: 'https://areascope.jp' },
                { '@type': 'ListItem', position: 2, name: '駅検索', item: 'https://areascope.jp/station' },
                { '@type': 'ListItem', position: 3, name: `${station.prefecture_name}${station.municipality_name}`, item: `https://areascope.jp/city/${station.prefecture_slug}/${station.municipality_slug}` },
                { '@type': 'ListItem', position: 4, name: `${station.station_name}駅` },
              ],
            }),
          }}
        />
        <nav style={{ marginBottom: '1.5rem', fontSize: '0.85rem', color: '#6b7a99' }}>
          <Link href="/" style={{ color: '#6b7a99', textDecoration: 'none' }}>トップ</Link>
          {' / '}
          <Link href="/station" style={{ color: '#6b7a99', textDecoration: 'none' }}>駅検索</Link>
          {' / '}
          <Link href={`/city/${station.prefecture_slug}/${station.municipality_slug}`} style={{ color: '#6b7a99', textDecoration: 'none' }}>
            {station.prefecture_name}{station.municipality_name}
          </Link>
          {' / '}
          <span style={{ color: '#e8edf5' }}>{station.station_name}駅</span>
        </nav>

        <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#00d4aa', letterSpacing: '3px', marginBottom: '12px' }}>// 駅データ</div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>
          {station.station_name}<span style={{ color: '#00d4aa' }}>駅</span>
        </h1>
        <p style={{ color: '#6b7a99', fontSize: '14px', marginBottom: '16px' }}>
          {station.line_names}｜{station.operator_names}｜{station.prefecture_name}{station.municipality_name}
        </p>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '32px' }}>
          <Link href={`/city/${station.prefecture_slug}/${station.municipality_slug}`} style={{ fontFamily: 'monospace', fontSize: '12px', color: '#00d4aa', background: 'rgba(0,212,170,0.1)', border: '1px solid #00d4aa', padding: '6px 12px', borderRadius: '6px', textDecoration: 'none' }}>
            🏙️ {station.municipality_name}の駅一覧
          </Link>
          {station.line_slug && (
            <Link href={`/line/${station.line_slug}`} style={{ fontFamily: 'monospace', fontSize: '12px', color: '#00d4aa', background: 'rgba(0,212,170,0.1)', border: '1px solid #00d4aa', padding: '6px 12px', borderRadius: '6px', textDecoration: 'none' }}>
              🗺️ 路線の駅一覧
            </Link>
          )}
          <Link href={`/station-ranking/${station.prefecture_slug}`} style={{ fontFamily: 'monospace', fontSize: '12px', color: '#6b7a99', background: '#111827', border: '1px solid #1e2d45', padding: '6px 12px', borderRadius: '6px', textDecoration: 'none' }}>
            🏆 {station.prefecture_name}の駅ランキング
          </Link>
          <Link href={`/prefecture/${station.prefecture_slug}`} style={{ fontFamily: 'monospace', fontSize: '12px', color: '#6b7a99', background: '#111827', border: '1px solid #1e2d45', padding: '6px 12px', borderRadius: '6px', textDecoration: 'none' }}>
            🗾 {station.prefecture_name}のエリア分析
          </Link>
        </div>

        <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '32px' }}>
          <div className="kpi">
            <div style={{ fontSize: '11px', color: '#6b7a99', fontFamily: 'monospace', marginBottom: '8px' }}>乗降者数（{latestPass?.year ?? '-'}年）</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#00d4aa' }}>
              {latestPass ? Number(latestPass.passengers).toLocaleString() : '-'}
            </div>
            <div style={{ fontSize: '11px', color: '#6b7a99' }}>人</div>
          </div>
          <div className="kpi">
            <div style={{ fontSize: '11px', color: '#6b7a99', fontFamily: 'monospace', marginBottom: '8px' }}>自治体人口（{latestPop?.year}年）</div>
            <div style={{ fontSize: '24px', fontWeight: 800 }}>
              {latestPop ? latestPop.population.toLocaleString() : '-'}
            </div>
            <div style={{ fontSize: '11px', color: '#6b7a99' }}>人</div>
          </div>
          <div className="kpi">
            <div style={{ fontSize: '11px', color: '#6b7a99', fontFamily: 'monospace', marginBottom: '8px' }}>人口変化（{oldestPop?.year}年比）</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: parseFloat(changeRate || '0') >= 0 ? '#00d4aa' : '#ff4757' }}>
              {changeRate ? `${parseFloat(changeRate) >= 0 ? '▲' : '▼'}${Math.abs(parseFloat(changeRate))}%` : '-'}
            </div>
            <div style={{ fontSize: '11px', color: '#6b7a99' }}>{oldestPop?.year}〜{latestPop?.year}年</div>
          </div>
        </div>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '12px', color: '#00d4aa' }}>
            {station.station_name}駅のデータ分析
          </h2>
          <p style={{ fontSize: '14px', color: '#9aa5c3', lineHeight: 1.8, marginBottom: '12px' }}>
            {station.station_name}駅は{station.prefecture_name}{station.municipality_name}に位置し、
            {station.line_names}（{station.operator_names}）が利用できる駅です。
          </p>
          <p style={{ fontSize: '14px', color: '#9aa5c3', lineHeight: 1.8, marginBottom: '12px' }}>
            最新の乗降者数は<strong style={{ color: '#e8edf5' }}>{latestPass ? Number(latestPass.passengers).toLocaleString() : 'データなし'}人</strong>、
            同エリアの人口は<strong style={{ color: '#e8edf5' }}>{latestPop?.population.toLocaleString() ?? 'データなし'}人</strong>となっています。
          </p>
          <p style={{ fontSize: '14px', color: '#9aa5c3', lineHeight: 1.8, marginBottom: '12px' }}>
            人口は{oldestPop?.year}年から{latestPop?.year}年にかけて
            <strong style={{ color: '#e8edf5' }}>
              {changeRate
                ? `${parseFloat(changeRate) >= 0 ? '増加' : '減少'}（${changeRate}%）`
                : '大きな変動なし'}
            </strong>
            しており、
            {parseFloat(changeRate || '0') >= 0
              ? 'エリアとしては人口が維持または増加している傾向があります。'
              : 'エリアとしては人口が減少傾向にあります。'}
          </p>
          <p style={{ fontSize: '14px', color: '#9aa5c3', lineHeight: 1.8, marginBottom: '12px' }}>
            {latestPass && latestPop && Number(latestPass.passengers) > latestPop.population * 0.7
              ? 'この駅は人の流れが比較的多く、商業・業務機能を持つエリアとしての特徴が見られます。'
              : 'この駅は居住者中心の比較的落ち着いたエリアとしての特徴が見られます。'}
          </p>
          <p style={{ fontSize: '14px', color: '#9aa5c3', lineHeight: 1.8 }}>
            乗降者数は駅周辺の人の流れを示し、人口は居住している人の規模を示します。
            これらのデータを組み合わせることで、駅周辺エリアの特徴や違いを把握することができます。
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '12px', color: '#00d4aa' }}>
            {station.station_name}駅の特徴と傾向
          </h2>
          <p style={{ fontSize: '14px', color: '#9aa5c3', lineHeight: 1.8, marginBottom: '12px' }}>
            {latestPass && Number(latestPass.passengers) > 100000
              ? `${station.station_name}駅は1日10万人以上が利用する主要ターミナル駅です。周辺エリアは交通利便性が高く、商業・業務・居住の複合エリアとしての性格を持ちます。`
              : latestPass && Number(latestPass.passengers) > 30000
              ? `${station.station_name}駅は1日3万人以上が利用する中規模以上の駅です。`
              : `${station.station_name}駅は地域密着型の駅です。`}
          </p>
          <p style={{ fontSize: '14px', color: '#9aa5c3', lineHeight: 1.8 }}>
            同規模の駅と比較しても、
            {latestPass && Number(latestPass.passengers) > 30000
              ? '比較的利用者数が多い駅といえます。'
              : '平均的な利用規模の駅といえます。'}
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '12px', color: '#00d4aa' }}>
            {station.station_name}駅に関するよくある質問
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: '8px', padding: '16px' }}>
              <p style={{ fontWeight: 700, marginBottom: '8px' }}>Q. {station.station_name}駅の利用者数は多いですか？</p>
              <p style={{ color: '#9aa5c3', fontSize: '14px', lineHeight: 1.7, margin: 0 }}>
                {latestPass
                  ? `${Number(latestPass.passengers).toLocaleString()}人が利用しており、${
                      Number(latestPass.passengers) > 30000 ? '比較的利用者数が多い駅です。' : '平均的な利用規模の駅です。'
                    }`
                  : '現在、利用者数データは取得中です。'}
              </p>
            </div>
            <div style={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: '8px', padding: '16px' }}>
              <p style={{ fontWeight: 700, marginBottom: '8px' }}>Q. {station.station_name}駅周辺の人口は増えていますか？</p>
              <p style={{ color: '#9aa5c3', fontSize: '14px', lineHeight: 1.7, margin: 0 }}>
                {changeRate
                  ? `${oldestPop?.year}年から${latestPop?.year}年にかけて${changeRate}% ${
                      parseFloat(changeRate) >= 0 ? '増加' : '減少'
                    }しています。`
                  : '人口データは現在整備中です。'}
              </p>
            </div>
            <div style={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: '8px', padding: '16px' }}>
              <p style={{ fontWeight: 700, marginBottom: '8px' }}>Q. {station.station_name}駅はどのようなエリアですか？</p>
              <p style={{ color: '#9aa5c3', fontSize: '14px', lineHeight: 1.7, margin: 0 }}>
                {latestPass && latestPop && Number(latestPass.passengers) > latestPop.population * 0.7
                  ? '人の流れが多く、商業・業務機能が集まるエリアと考えられます。'
                  : '居住者中心の落ち着いたエリアと考えられます。'}
              </p>
            </div>
          </div>
        </section>

        {passengerRows.length > 0 && (
          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.3rem', color: '#00d4aa', marginBottom: '1rem' }}>乗降者数推移</h2>
            <p style={{ color: '#6b7a99', fontSize: '12px', marginBottom: '12px' }}>
              ※本ページの最新データは{passengerRows[passengerRows.length - 1].year}年度（国土数値情報）です。
            </p>
            <div style={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: '12px', padding: '24px' }}>
              {passengerRows.map(row => {
                const pct = maxPass > 0 ? (Number(row.passengers) / maxPass) * 100 : 0;
                return (
                  <div key={row.year} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#6b7a99', width: '40px', textAlign: 'right' }}>{row.year}</div>
                    <div style={{ flex: 1, background: '#1e2d45', borderRadius: '4px', height: '28px' }}>
                      <div style={{ width: `${pct}%`, background: '#00d4aa', borderRadius: '4px', height: '28px', display: 'flex', alignItems: 'center', paddingLeft: '8px', fontSize: '11px', fontFamily: 'monospace', color: '#0a0e1a', fontWeight: 700, minWidth: pct > 0 ? '80px' : '0', overflow: 'hidden' }}>
                        {Number(row.passengers).toLocaleString()}人
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {populationRows.length > 0 && (
          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.3rem', color: '#00d4aa', marginBottom: '1rem' }}>
              {station.municipality_name}の人口推移
            </h2>
            <div style={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: '12px', padding: '24px' }}>
              {populationRows.map(row => {
                const pct = maxPop > 0 ? (row.population / maxPop) * 100 : 0;
                return (
                  <div key={row.year} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#6b7a99', width: '40px', textAlign: 'right' }}>{row.year}</div>
                    <div style={{ flex: 1, background: '#1e2d45', borderRadius: '4px', height: '28px' }}>
                      <div style={{ width: `${pct}%`, background: '#1e5a8e', borderRadius: '4px', height: '28px', display: 'flex', alignItems: 'center', paddingLeft: '8px', fontSize: '11px', fontFamily: 'monospace', color: '#e8edf5', fontWeight: 700, minWidth: pct > 0 ? '80px' : '0', overflow: 'hidden' }}>
                        {row.population.toLocaleString()}人
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {sameLineStations.length > 0 && (
          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.3rem', color: '#00d4aa', marginBottom: '1rem' }}>同じ路線の主要駅</h2>
            <div style={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: '12px', padding: '16px 20px' }}>
              {sameLineStations.map((s) => (
                <div key={s.station_group_slug} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #1e2d45' }}>
                  <Link href={`/station/${s.station_group_slug}`} style={{ color: '#e8edf5', textDecoration: 'none', fontWeight: 700, fontSize: '14px' }}>
                    {s.station_name}駅
                  </Link>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ color: '#6b7a99', fontSize: '12px', fontFamily: 'monospace' }}>
                      {s.passengers ? `${Number(s.passengers).toLocaleString()}人` : '-'}
                    </span>
                    <Link href={`/station/${s.station_group_slug}`} style={{ color: '#00d4aa', textDecoration: 'none', fontSize: '11px', border: '1px solid #00d4aa', borderRadius: '4px', padding: '3px 8px' }}>
                      詳細
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 style={{ fontSize: '1.3rem', color: '#00d4aa', marginBottom: '1rem' }}>関連ページ</h2>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link href={`/city/${station.prefecture_slug}/${station.municipality_slug}`} style={{ color: '#00d4aa', textDecoration: 'none', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', fontSize: '0.9rem' }}>
              🏙️ {station.municipality_name}の駅一覧
            </Link>
            {station.line_slug && (
              <Link href={`/line/${station.line_slug}`} style={{ color: '#00d4aa', textDecoration: 'none', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', fontSize: '0.9rem' }}>
                🗺️ 路線の駅一覧
              </Link>
            )}
            <Link href={`/station-ranking/${station.prefecture_slug}`} style={{ color: '#00d4aa', textDecoration: 'none', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', fontSize: '0.9rem' }}>
              🏆 {station.prefecture_name}の駅ランキング
            </Link>
            <Link href={`/prefecture/${station.prefecture_slug}`} style={{ color: '#6b7a99', textDecoration: 'none', border: '1px solid #1e2d45', borderRadius: '6px', padding: '10px 20px', fontSize: '0.9rem' }}>
              🗾 {station.prefecture_name}のエリア分析
            </Link>
          </div>
        </section>

        {station.prefecture_slug && station.prefecture_name && (
          <div
            style={{
              background: '#111827',
              border: '1px solid #1e2d45',
              borderRadius: '8px',
              padding: '20px 24px',
              marginTop: '32px',
            }}
          >
            <p style={{ color: '#6b7a99', fontSize: '13px', marginBottom: '4px' }}>
              この都道府県の関連ランキング
            </p>
            <p style={{ color: '#aaa', fontSize: '13px', marginBottom: '16px' }}>
              この駅がある都道府県の人口・人流・成長エリア関連ランキングをまとめて確認できます。
            </p>

            {[
              {
                label: `${station.prefecture_name}の駅回復率ランキング`,
                path: `/articles/station-passenger-recovery/${station.prefecture_slug}`,
              },
              {
                label: `${station.prefecture_name}の人口増加自治体ランキング`,
                path: `/population-ranking/${station.prefecture_slug}`,
              },
              {
                label: `${station.prefecture_name}の人口減少自治体ランキング`,
                path: `/population-decline-ranking/${station.prefecture_slug}`,
              },
              {
                label: `${station.prefecture_name}の成長エリアランキング`,
                path: `/articles/growth-area-ranking/${station.prefecture_slug}`,
              },
              {
                label: `${station.prefecture_name}の人口減×人流強い街ランキング`,
                path: `/articles/population-decline-high-passenger/${station.prefecture_slug}`,
              },
            ].map((link) => (
              <Link
                key={link.path}
                href={link.path}
                style={{
                  display: 'block',
                  color: '#00d4aa',
                  fontSize: '14px',
                  textDecoration: 'none',
                  marginBottom: '8px',
                }}
              >
                → {link.label}
              </Link>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}