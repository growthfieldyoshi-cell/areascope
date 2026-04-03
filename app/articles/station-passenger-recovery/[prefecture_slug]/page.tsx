import { neon } from '@neondatabase/serverless';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

const sql = neon(process.env.DATABASE_URL!);

type Props = { params: Promise<{ prefecture_slug: string }> };

const PRE_COVID_YEAR = 2019;

async function getLatestYear(): Promise<number> {
  const rows = await sql`SELECT MAX(year) AS year FROM station_passengers`;
  return rows[0]?.year ?? 2021;
}

async function getPrefectureName(slug: string): Promise<string | null> {
  const rows = await sql`
    SELECT DISTINCT prefecture_name
    FROM stations
    WHERE prefecture_slug = ${slug}
    LIMIT 1
  `;
  return rows.length > 0 ? rows[0].prefecture_name : null;
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
  return {
    title: `${prefName}の駅乗降者数回復率ランキング｜AreaScope`,
    description: `${prefName}内の駅乗降者数を2019年と最新年で比較し、回復率の高い駅をランキング形式で紹介。県内の人流回復状況をデータで可視化。`,
    alternates: { canonical: `https://areascope.jp/articles/station-passenger-recovery/${prefecture_slug}` },
  };
}

type RankingRow = {
  station_group_slug: string;
  station_name: string;
  passengers_2019: number;
  passengers_latest: number;
  recovery_rate: number;
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

export default async function PrefectureRecoveryPage({ params }: Props) {
  const { prefecture_slug } = await params;
  const prefName = await getPrefectureName(prefecture_slug);
  if (!prefName) notFound();

  const latestYear = await getLatestYear();

  const rows = (await sql`
    SELECT
      s.station_group_slug,
      MAX(s.station_name) AS station_name,
      CAST(SUM(CASE WHEN sp.year = ${PRE_COVID_YEAR} THEN sp.passengers ELSE 0 END) AS bigint) AS passengers_2019,
      CAST(SUM(CASE WHEN sp.year = ${latestYear} THEN sp.passengers ELSE 0 END) AS bigint) AS passengers_latest,
      ROUND(
        SUM(CASE WHEN sp.year = ${latestYear} THEN sp.passengers ELSE 0 END)::numeric
        / SUM(CASE WHEN sp.year = ${PRE_COVID_YEAR} THEN sp.passengers ELSE 0 END)::numeric
        * 100,
        1
      ) AS recovery_rate
    FROM stations s
    INNER JOIN station_passengers sp
      ON s.station_key = sp.station_key
      AND sp.year IN (${PRE_COVID_YEAR}, ${latestYear})
    WHERE s.station_group_slug IS NOT NULL
      AND s.prefecture_slug = ${prefecture_slug}
      AND sp.passengers > 0
    GROUP BY s.station_group_slug
    HAVING
      SUM(CASE WHEN sp.year = ${PRE_COVID_YEAR} THEN sp.passengers END) IS NOT NULL
      AND SUM(CASE WHEN sp.year = ${PRE_COVID_YEAR} THEN sp.passengers ELSE 0 END) > 0
      AND SUM(CASE WHEN sp.year = ${latestYear} THEN sp.passengers END) IS NOT NULL
      AND SUM(CASE WHEN sp.year = ${latestYear} THEN sp.passengers ELSE 0 END) > 0
    ORDER BY recovery_rate DESC
    LIMIT 50
  `) as RankingRow[];

  if (rows.length === 0) notFound();

  return (
    <main style={{ background: '#0a0e1a', minHeight: '100vh', color: '#e8edf5', fontFamily: 'sans-serif' }}>
      <article style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 20px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '16px', lineHeight: 1.4 }}>
          {prefName}の駅乗降者数<span style={{ color: '#00d4aa' }}>回復率</span>ランキング
        </h1>

        <p style={{ color: '#e8edf5', fontSize: '16px', lineHeight: 1.8, marginBottom: '12px', fontWeight: 600 }}>
          {prefName}内の駅で、コロナ前の水準をどれだけ取り戻しているかを比較します。
        </p>
        <p style={{ ...pStyle, marginBottom: '32px' }}>
          国土交通省「国土数値情報」のデータをもとに、{PRE_COVID_YEAR}年（コロナ前）と{latestYear}年（最新）の乗降者数を比較し、{prefName}内の駅を回復率順にランキングしました。同じ駅名に複数路線がある場合は合算した数値です。全国版は<Link href="/articles/station-passenger-recovery-analysis" style={linkStyle}>駅乗降者数の回復率ランキング（コロナ前後）</Link>をご覧ください。
        </p>

        {/* ランキングテーブル */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>{prefName}の回復率ランキング（{PRE_COVID_YEAR}年→{latestYear}年）</h2>
          <p style={{ ...pStyle, marginBottom: '16px' }}>
            回復率 = {latestYear}年の乗降者数 / {PRE_COVID_YEAR}年の乗降者数 × 100 で算出。100%超えはコロナ前水準を上回った駅です。
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #1e2d45' }}>
                  {['順位', '駅名', `${PRE_COVID_YEAR}年`, `${latestYear}年`, '回復率'].map((h) => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: '#aaa', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => {
                  const rate = Number(row.recovery_rate);
                  const rateColor = rate >= 100 ? '#00d4aa' : rate >= 80 ? '#e8edf5' : '#f87171';
                  return (
                    <tr key={row.station_group_slug} style={{ borderBottom: '1px solid #1e2d45' }}>
                      <td style={{ padding: '10px 16px', color: index < 3 ? '#00d4aa' : '#aaa', fontWeight: index < 3 ? 'bold' : 'normal' }}>
                        {index + 1}位
                      </td>
                      <td style={{ padding: '10px 16px', fontWeight: 'bold' }}>
                        <Link href={`/station/${row.station_group_slug}`} style={{ color: '#e8edf5', textDecoration: 'none' }}>
                          {row.station_name}駅
                        </Link>
                      </td>
                      <td style={{ padding: '10px 16px', whiteSpace: 'nowrap' }}>
                        {Number(row.passengers_2019).toLocaleString()}人
                      </td>
                      <td style={{ padding: '10px 16px', whiteSpace: 'nowrap' }}>
                        {Number(row.passengers_latest).toLocaleString()}人
                      </td>
                      <td style={{ padding: '10px 16px', fontWeight: 'bold', whiteSpace: 'nowrap', color: rateColor }}>
                        {rate.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ロジック説明 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>このランキングの見方</h2>
          <p style={pStyle}>
            回復率は「{latestYear}年の乗降者数 / {PRE_COVID_YEAR}年の乗降者数 × 100」で算出しています。100%であればコロナ前と同水準、100%を超えていればコロナ前を上回ったことを意味します。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            回復率が高い駅は、観光需要の回復、再開発による新規利用者の増加、沿線の人口増加などが背景にあります。逆に回復率が低い駅は、リモートワーク定着によるオフィス通勤の減少や、定期券利用者の構造的な減少が影響している可能性があります。
          </p>
        </div>

        {/* 回復が進んでいる駅の特徴 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>{prefName}で回復が進んでいる駅の特徴</h2>
          <ul style={{ color: '#aaa', fontSize: '15px', lineHeight: 2.2, paddingLeft: '20px', marginBottom: 0 }}>
            <li>観光需要やインバウンド回復の恩恵を受けている駅</li>
            <li>再開発や大型商業施設の開業により新たな来街者が増加した駅</li>
            <li>沿線の人口増加が続き、通勤・通学の実需が拡大している駅</li>
            <li>複数路線が乗り入れ、乗り換え需要が底堅く推移しているターミナル駅</li>
            <li>郊外住宅地の最寄り駅で、生活利用の需要が安定している駅</li>
          </ul>
        </div>

        {/* まとめ */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>まとめ</h2>
          <p style={pStyle}>
            {prefName}内でも、駅ごとにコロナ後の回復状況は大きく異なります。観光駅・商業駅・住宅駅など、駅の役割によって回復のスピードに差があり、その違いはエリアの人流構造を反映しています。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            エリア選定や商圏分析においては、回復率を確認することで「今、実際に人が戻っている場所」を把握できます。気になる駅があれば、駅ページから時系列データを確認してみてください。
          </p>
        </div>

        {/* 内部リンク */}
        <div style={{ ...sectionStyle, textAlign: 'center' as const }}>
          <h2 style={{ ...h2Style, marginBottom: '12px' }}>関連データを見る</h2>
          <p style={{ color: '#6b7a99', fontSize: '13px', marginBottom: '16px' }}>
            気になる駅やエリアがあれば、詳細データを確認してみてください。
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/articles/station-passenger-recovery-analysis" style={{ display: 'inline-block', color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
              全国版 回復率ランキング
            </Link>
            <Link href="/station-ranking" style={{ display: 'inline-block', color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
              全国駅ランキング
            </Link>
            <Link href="/articles/prefecture-ranking" style={{ display: 'inline-block', color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
              都道府県別駅ランキング一覧
            </Link>
            <Link href="/articles" style={{ display: 'inline-block', color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
              他の記事を見る
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}
