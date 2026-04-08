import { neon } from '@neondatabase/serverless';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '福島県の駅乗降者数ランキング｜主要駅TOP20',
  description: '福島県の駅乗降者数ランキングTOP20を掲載しています。',
  alternates: {
    canonical: 'https://areascope.jp/station-ranking/fukushima',
  },
};


const sql = neon(process.env.DATABASE_URL!);

async function getLatestYear(): Promise<number> {
  const rows = await sql`SELECT MAX(year) AS year FROM station_passengers`;
  return rows[0]?.year ?? 2021;
}

type RankingRow = {
  station_group_slug: string;
  station_name: string;
  municipality_name: string;
  line_name: string;
  operator_name: string;
  passengers: number | null;
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

const h3Style = {
  fontSize: '16px',
  fontWeight: 700 as const,
  color: '#e8edf5',
  marginBottom: '10px',
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

export default async function FukushimaStationRanking2023Page() {
  const year = await getLatestYear();

  const rows = (await sql`
    SELECT
      s.station_group_slug,
      MAX(s.station_name) AS station_name,
      MAX(s.municipality_name) AS municipality_name,
      MAX(s.line_name) AS line_name,
      MAX(s.operator_name) AS operator_name,
      CAST(SUM(sp.passengers) AS bigint) AS passengers
    FROM stations s
    LEFT JOIN station_passengers sp
      ON s.station_key = sp.station_key
      AND sp.year = ${year}
    WHERE s.station_group_slug IS NOT NULL
      AND s.prefecture_slug = 'fukushima'
    GROUP BY s.station_group_slug
    HAVING SUM(sp.passengers) IS NOT NULL
    ORDER BY passengers DESC NULLS LAST
    LIMIT 20
  `) as RankingRow[];

  return (
    <main style={{ background: '#0a0e1a', minHeight: '100vh', color: '#e8edf5', fontFamily: 'sans-serif' }}>
      <article style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 20px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '16px', lineHeight: 1.4 }}>
          福島県の駅<span style={{ color: '#00d4aa' }}>乗降者数</span>ランキング（{year}年）
        </h1>

        <p style={{ color: '#e8edf5', fontSize: '16px', lineHeight: 1.8, marginBottom: '12px', fontWeight: 600 }}>
          {year}年、福島県で最も利用者が多い駅は福島駅・郡山駅エリアです。
        </p>
        <p style={{ ...pStyle, marginBottom: '32px' }}>
          福島県は中通り・会津・浜通りの三地域構造を持ち、福島市と郡山市が県の二大拠点です。国土交通省「国土数値情報」の{year}年データをもとに、福島県の駅別乗降者数ランキングTOP20と、上位駅の特徴・エリア分析への活用方法を解説します。最新の完全版ランキングは<Link href="/station-ranking/fukushima" style={linkStyle}>福島県の駅乗降者数ランキング（全件）</Link>から確認できます。
        </p>

        {/* TOP20テーブル */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>福島県の駅乗降者数ランキングTOP20（{year}年）</h2>
          <p style={{ ...pStyle, marginBottom: '16px' }}>
            以下は{year}年の福島県における駅別乗降者数ランキングです。同じ駅名に複数路線がある場合は合算した数値です。
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #1e2d45' }}>
                  {['順位', '駅名', '所在地', `乗降者数（${year}年）`, ''].map((h) => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: '#aaa' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={row.station_group_slug} style={{ borderBottom: '1px solid #1e2d45' }}>
                    <td style={{ padding: '10px 16px', color: index < 3 ? '#00d4aa' : '#aaa', fontWeight: index < 3 ? 'bold' : 'normal' }}>
                      {index + 1}位
                    </td>
                    <td style={{ padding: '10px 16px', fontWeight: 'bold' }}>
                      <Link href={`/station/${row.station_group_slug}`} style={{ color: '#e8edf5', textDecoration: 'none' }}>
                        {row.station_name}駅
                      </Link>
                    </td>
                    <td style={{ padding: '10px 16px', color: '#aaa' }}>{row.municipality_name}</td>
                    <td style={{ padding: '10px 16px' }}>
                      {row.passengers ? `${Number(row.passengers).toLocaleString()}人` : '-'}
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <Link href={`/station/${row.station_group_slug}`} style={{ color: '#00d4aa', textDecoration: 'none', fontSize: '0.85rem', border: '1px solid #00d4aa', borderRadius: '4px', padding: '4px 10px' }}>
                        詳細
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 分析 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>なぜこの順位になるのか</h2>

          <div style={{ marginBottom: '16px' }}>
            <h3 style={h3Style}>福島駅の特徴</h3>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              <Link href="/station/fukushima-fukushima-fukushimashi" style={linkStyle}>福島駅</Link>は東北新幹線と山形新幹線の分岐点であり、県庁所在地・福島市の中心駅です。JR東北本線・奥羽本線・阿武隈急行・福島交通飯坂線も乗り入れ、県北部の交通の要衝として高い乗降者数を記録しています。
            </p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <h3 style={h3Style}>郡山駅の特徴</h3>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              <Link href="/station/kouriyama-fukushima-kooriyamashi" style={linkStyle}>郡山駅</Link>は東北新幹線の停車駅であり、磐越西線・磐越東線・水郡線の結節点です。福島県内最大の商業都市・郡山市の中心に位置し、ビジネス・商業の需要が非常に高い駅です。東北本線と磐越線の十字路として、県中央部の交通ハブの役割を果たしています。
            </p>
          </div>

          <div>
            <h3 style={h3Style}>福島県の鉄道利用の特徴</h3>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              福島県は中通り・会津・浜通りの三地域構造が特徴的です。中通りの東北新幹線沿線（福島・郡山）に鉄道利用が集中しており、郡山と福島が県の二大拠点として機能しています。会津地方は磐越西線、浜通りは常磐線がそれぞれの地域の足を担っています。
            </p>
          </div>
        </div>

        {/* エリア解説 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>上位駅周辺のエリア特徴</h2>

          <div style={{ marginBottom: '16px' }}>
            <h3 style={h3Style}>福島市エリア</h3>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              福島市は県の行政の中心地で、福島駅周辺にオフィスや商業施設が集積しています。山形新幹線の分岐点として山形方面へのアクセスも良好で、果物の産地としても知られています。
            </p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <h3 style={h3Style}>郡山エリア</h3>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              郡山市は福島県最大の商業都市であり、郡山駅周辺は県内で最も商業機能が充実したエリアです。東北新幹線で東京から約80分と、首都圏とのアクセスも良好で、ビジネス拠点としての需要が高いです。
            </p>
          </div>

          <div>
            <h3 style={h3Style}>住みやすさとのバランス</h3>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              乗降者数が多い＝住みやすいとは限りません。福島県では新幹線停車駅周辺は利便性が高いですが、三地域それぞれに異なる生活圏があります。人口推移データと合わせて確認すると、居住需要の実態がより正確に把握できます。
            </p>
          </div>
        </div>

        {/* データの見方 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>乗降者数データの見方</h2>
          <p style={pStyle}>
            乗降者数は国土交通省「国土数値情報」に基づく{year}年のデータです。各鉄道事業者が独自に算出しており、事業者間で厳密な比較が難しい場合があります。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            AreaScopeでは各駅の時系列推移を確認できるため、コロナ前後の回復度合いや長期トレンドを把握するのにも活用できます。<Link href="/station-ranking/fukushima" style={linkStyle}>福島県の駅ランキング（全件）</Link>では100位までの完全版を掲載しています。
          </p>
        </div>

        {/* まとめ */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>まとめ</h2>
          <p style={pStyle}>
            {year}年の福島県駅乗降者数ランキングでは、福島駅と郡山駅が上位を占めています。東北新幹線と山形新幹線の分岐点である福島駅と、複数路線の結節点である郡山駅が県の二大拠点として鉄道利用を牽引しています。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            エリア選びにおいては、乗降者数の絶対値だけでなく、駅のタイプ（ターミナル型か住宅駅型か）と人口推移を合わせて判断することが重要です。AreaScopeでは駅ごとの詳細データと市区町村の人口推移を合わせて確認できます。
          </p>
        </div>

        <p style={{ color: '#6b7a99', fontSize: '13px', marginBottom: '24px' }}>
          全国の都道府県ランキング一覧は<Link href="/articles/prefecture-ranking" style={linkStyle}>都道府県別駅乗降者数ランキング一覧</Link>もご覧ください。
        </p>

        {/* CTA */}
        <div style={{ ...sectionStyle, textAlign: 'center' as const }}>
          <h2 style={{ ...h2Style, marginBottom: '12px' }}>福島県の駅データを詳しく見る</h2>
          <p style={{ color: '#6b7a99', fontSize: '13px', marginBottom: '16px' }}>
            気になる駅があれば、詳細データを確認してみてください。
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/station-ranking/fukushima" style={{ display: 'inline-block', color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
              福島県の全駅ランキング
            </Link>
            <Link href="/station/list" style={{ display: 'inline-block', color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
              駅一覧から探す
            </Link>
            <Link href="/city" style={{ display: 'inline-block', color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
              市区町村の人口推移
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
