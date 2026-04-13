import { neon } from '@neondatabase/serverless';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

const sql = neon(process.env.DATABASE_URL!);

type Props = { params: Promise<{ prefecture_slug: string }> };

async function getPrefectureName(slug: string): Promise<string | null> {
  const rows = await sql`
    SELECT DISTINCT prefecture_name
    FROM stations
    WHERE prefecture_slug = ${slug}
    LIMIT 1
  `;
  return rows.length > 0 ? rows[0].prefecture_name : null;
}

async function getPopulationYears(): Promise<{ older: number; newer: number }> {
  const rows = await sql`
    SELECT DISTINCT year FROM municipality_populations ORDER BY year DESC LIMIT 2
  `;
  const newer = rows[0]?.year ?? 2020;
  const older = rows[1]?.year ?? 2015;
  return { older, newer };
}

export async function generateStaticParams() {
  const rows = await sql`
    SELECT DISTINCT prefecture_slug
    FROM stations
    WHERE prefecture_slug IS NOT NULL
  `;
  return rows.map((r) => ({ prefecture_slug: r.prefecture_slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { prefecture_slug } = await params;
  const prefName = await getPrefectureName(prefecture_slug);
  if (!prefName) return {};
  const title = `${prefName}の人口増加自治体ランキング【最新】｜市区町村別`;
  const description = `${prefName}で人口が増えている市区町村をランキング形式で紹介。直近2時点の人口データをもとに県内の人口動向を確認できます。`;
  return {
    title,
    description,
    alternates: { canonical: `https://areascope.jp/population-ranking/${prefecture_slug}` },
    openGraph: {
      type: 'website',
      title,
      description,
      url: `https://areascope.jp/population-ranking/${prefecture_slug}`,
      siteName: 'AreaScope',
    },
  };
}

type RankingRow = {
  municipality_code: string;
  municipality_name: string;
  municipality_slug: string;
  pop_older: number;
  pop_newer: number;
  growth_rate: number;
};

const sectionStyle = {
  background: '#111827',
  border: '1px solid #1e2d45',
  borderRadius: '12px',
  padding: '28px',
  marginBottom: '24px',
};

const h2Style = {
  fontSize: '20px',
  fontWeight: 700 as const,
  color: '#00d4aa',
  marginBottom: '16px',
};

const pStyle = {
  color: '#aaa',
  fontSize: '15px',
  lineHeight: 1.8,
  marginBottom: '12px',
};

const linkStyle = {
  color: '#00d4aa',
  textDecoration: 'underline' as const,
};

export default async function PrefecturePopulationRankingPage({ params }: Props) {
  const { prefecture_slug } = await params;
  const prefName = await getPrefectureName(prefecture_slug);
  if (!prefName) notFound();

  const { older: popOlderYear, newer: popNewerYear } = await getPopulationYears();

  const rows = (await sql`
    WITH muni_stations AS (
      SELECT
        CASE
          WHEN LENGTH(municipality_code) = 5
            AND SUBSTRING(municipality_code, 5, 1) != '0'
          THEN SUBSTRING(municipality_code, 1, 4) || '0'
          ELSE municipality_code
        END AS municipality_code,
        municipality_name,
        municipality_slug
      FROM stations
      WHERE prefecture_slug = ${prefecture_slug}
        AND municipality_code IS NOT NULL
        AND municipality_slug IS NOT NULL
      GROUP BY
        CASE
          WHEN LENGTH(municipality_code) = 5
            AND SUBSTRING(municipality_code, 5, 1) != '0'
          THEN SUBSTRING(municipality_code, 1, 4) || '0'
          ELSE municipality_code
        END,
        municipality_name,
        municipality_slug
    )
    SELECT
      mp.municipality_code,
      MAX(ms.municipality_name) AS municipality_name,
      MAX(ms.municipality_slug) AS municipality_slug,
      MAX(CASE WHEN mp.year = ${popOlderYear} THEN mp.population END) AS pop_older,
      MAX(CASE WHEN mp.year = ${popNewerYear} THEN mp.population END) AS pop_newer,
      ROUND(
        ((MAX(CASE WHEN mp.year = ${popNewerYear} THEN mp.population END)::numeric
          - MAX(CASE WHEN mp.year = ${popOlderYear} THEN mp.population END)::numeric)
          / MAX(CASE WHEN mp.year = ${popOlderYear} THEN mp.population END)::numeric) * 100,
        2
      ) AS growth_rate
    FROM municipality_populations mp
    INNER JOIN muni_stations ms
      ON mp.municipality_code = ms.municipality_code
    WHERE mp.year IN (${popOlderYear}, ${popNewerYear})
      AND SUBSTRING(mp.municipality_code, 5, 1) = '0'
    GROUP BY mp.municipality_code
    HAVING
      MAX(CASE WHEN mp.year = ${popOlderYear} THEN mp.population END) IS NOT NULL
      AND MAX(CASE WHEN mp.year = ${popOlderYear} THEN mp.population END) > 0
      AND MAX(CASE WHEN mp.year = ${popNewerYear} THEN mp.population END) IS NOT NULL
      AND ((MAX(CASE WHEN mp.year = ${popNewerYear} THEN mp.population END)::numeric
            - MAX(CASE WHEN mp.year = ${popOlderYear} THEN mp.population END)::numeric)
            / MAX(CASE WHEN mp.year = ${popOlderYear} THEN mp.population END)::numeric) > 0
    ORDER BY growth_rate DESC
    LIMIT 50
  `) as RankingRow[];

  if (rows.length === 0) notFound();

  return (
    <main style={{ background: '#0a0e1a', minHeight: '100vh', color: '#e8edf5', fontFamily: 'sans-serif' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'トップ', item: 'https://areascope.jp' },
              { '@type': 'ListItem', position: 2, name: '人口分析', item: 'https://areascope.jp/population' },
              { '@type': 'ListItem', position: 3, name: `${prefName}の人口増加ランキング` },
            ],
          }),
        }}
      />
      <article style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 20px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '16px', lineHeight: 1.4 }}>
          {prefName}の<span style={{ color: '#00d4aa' }}>人口増加自治体</span>ランキング
        </h1>

        <p style={{ color: '#e8edf5', fontSize: '16px', lineHeight: 1.8, marginBottom: '12px', fontWeight: 600 }}>
          {prefName}内で人口が増えている市区町村を、増加率順にランキングしました。
        </p>
        <p style={{ ...pStyle, marginBottom: '32px' }}>
          総務省「国勢調査」のデータをもとに、{popOlderYear}年と{popNewerYear}年の人口を比較し、人口増加率が高い自治体を上位に掲載しています。人口増加は住宅需要や生活インフラの充実を示す指標のひとつですが、増加の背景は自治体ごとに異なります。
        </p>

        {/* ランキングテーブル */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>{prefName}の人口増加自治体ランキング（{popOlderYear}年→{popNewerYear}年）</h2>
          <p style={{ ...pStyle, marginBottom: '16px' }}>
            人口増加率 = ({popNewerYear}年人口 - {popOlderYear}年人口) / {popOlderYear}年人口 × 100 で算出。増加率がプラスの自治体のみ掲載しています。
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #1e2d45' }}>
                  {['順位', '自治体名', `${popOlderYear}年`, `${popNewerYear}年`, '増加率'].map((h) => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: '#aaa', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={row.municipality_code} style={{ borderBottom: '1px solid #1e2d45' }}>
                    <td style={{ padding: '10px 16px', color: index < 3 ? '#00d4aa' : '#aaa', fontWeight: index < 3 ? 'bold' : 'normal' }}>
                      {index + 1}位
                    </td>
                    <td style={{ padding: '10px 16px', fontWeight: 'bold' }}>
                      <Link href={`/city/${prefecture_slug}/${row.municipality_slug}`} style={{ color: '#e8edf5', textDecoration: 'none' }}>
                        {row.municipality_name}
                      </Link>
                    </td>
                    <td style={{ padding: '10px 16px', whiteSpace: 'nowrap' }}>
                      {Number(row.pop_older).toLocaleString()}人
                    </td>
                    <td style={{ padding: '10px 16px', whiteSpace: 'nowrap' }}>
                      {Number(row.pop_newer).toLocaleString()}人
                    </td>
                    <td style={{ padding: '10px 16px', color: '#00d4aa', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                      +{Number(row.growth_rate).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ロジック説明 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>このランキングの見方</h2>
          <p style={pStyle}>
            人口増加率は{popOlderYear}年と{popNewerYear}年の国勢調査データを比較して算出しています。増加率が高い自治体は、住宅供給の拡大や子育て世帯の流入、再開発による新規居住者の増加などが背景にあるケースが多く見られます。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            ただし、人口増加率だけでは街の全体像は見えません。もともと人口が少ない自治体は増加率が高く出やすく、大規模自治体は増加率が控えめでも絶対数の増加が大きいことがあります。増加率と実数の両方を確認することが重要です。
          </p>
        </div>

        {/* 人口が増えている自治体の特徴 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>{prefName}で人口が増えている自治体の特徴</h2>
          <ul style={{ color: '#aaa', fontSize: '15px', lineHeight: 2.2, paddingLeft: '20px', marginBottom: 0 }}>
            <li>再開発やマンション建設が進み、都心部からの人口流入が続いている</li>
            <li>鉄道アクセスが改善し、通勤圏として選ばれやすくなっている</li>
            <li>子育て支援施策が充実し、ファミリー世帯の転入が増加している</li>
            <li>大型商業施設や生活インフラの整備により、居住地としての魅力が向上している</li>
            <li>土地価格が比較的手ごろで、住宅の取得コストが近隣自治体より低い</li>
          </ul>
        </div>

        {/* まとめ */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>まとめ</h2>
          <p style={pStyle}>
            {prefName}内でも自治体ごとに人口動向は大きく異なります。人口が増えている自治体は、住宅需要の高さやエリアとしての成長性を示す指標のひとつです。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            居住地選びや不動産投資の検討においては、人口増加率に加えて駅の乗降者数も合わせて確認すると、エリアの実需をより正確に把握できます。AreaScopeでは<Link href="/population" style={linkStyle}>市区町村の人口推移</Link>を個別に確認できます。
          </p>
        </div>

        {/* 内部リンク */}
        <div style={{ ...sectionStyle, textAlign: 'center' as const }}>
          <h2 style={{ ...h2Style, marginBottom: '12px' }}>関連データを見る</h2>
          <p style={{ color: '#6b7a99', fontSize: '13px', marginBottom: '16px' }}>
            気になる自治体やエリアがあれば、詳細データを確認してみてください。
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/articles/population-analysis" style={{ display: 'inline-block', color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
              人口分析の記事一覧
            </Link>
            <Link href="/articles/growth-areas" style={{ display: 'inline-block', color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
              成長エリア分析
            </Link>
            <Link href="/population" style={{ display: 'inline-block', color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
              人口分析ツール
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}
