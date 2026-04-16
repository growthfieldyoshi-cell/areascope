import type { Metadata } from 'next';
import Link from 'next/link';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export const metadata: Metadata = {
  title: 'AreaScope｜駅・エリアデータを可視化',
  description: '全国の駅乗降者数・市区町村人口推移を可視化。全国9,012駅・1,256市区町村の公式データを無料で閲覧できます。',
  alternates: {
    canonical: 'https://areascope.jp',
  },
};

export default async function Home() {
  const yearRows = await sql`SELECT MIN(year) AS min_year, MAX(year) AS max_year FROM station_passengers`;
  const minYear = yearRows[0]?.min_year ?? 2011;
  const maxYear = yearRows[0]?.max_year ?? 2021;

  return (
    <main style={{
      minHeight: '100vh',
      background: '#0a0e1a',
      color: '#e8edf5',
      fontFamily: "'Noto Sans JP', sans-serif",
      display: 'flex',
      flexDirection: 'column',
    }}>
      <style>{`
        .hero { padding: 60px 32px 40px; max-width: 1200px; margin: 0 auto; width: 100%; box-sizing: border-box; }
        .hero-title { font-size: 52px; font-weight: 800; line-height: 1.1; margin-bottom: 24px; }
        .hero-meta { display: flex; gap: 24px; flex-wrap: wrap; margin-bottom: 0; }
        .hero-meta-item { font-family: monospace; font-size: 12px; color: #6b7a99; }
        .hero-meta-item span { color: #00d4aa; font-weight: 700; }
        .nav-section { max-width: 1200px; margin: 0 auto; padding: 0 32px 60px; width: 100%; box-sizing: border-box; }
        .nav-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        .nav-card { background: #111827; border: 1px solid #1e2d45; border-radius: 12px; padding: 28px; text-decoration: none; color: #e8edf5; display: flex; flex-direction: column; gap: 10px; }
        .nav-card:hover { border-color: #00d4aa; }
        .nav-card-icon { font-size: 28px; }
        .nav-card-title { font-size: 18px; font-weight: 700; color: #00d4aa; }
        .nav-card-desc { font-size: 13px; color: #6b7a99; line-height: 1.7; }
        .nav-card-link { font-size: 12px; color: #00d4aa; font-family: monospace; margin-top: 4px; }
        .header-nav { display: flex; gap: 10px; flex-wrap: wrap; }
        .read-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        @media (max-width: 768px) {
          .hero { padding: 40px 20px 32px; }
          .hero-title { font-size: 36px; }
          .nav-section { padding: 0 20px 40px; }
          .nav-grid { grid-template-columns: 1fr; }
          .header-nav { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; }
          .header-nav a { text-align: center; font-size: 11px !important; padding: 5px 8px !important; }
          .read-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <header style={{ padding: '16px 20px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', borderBottom: '1px solid #1e2d45', background: 'rgba(10,14,26,0.95)' }}>
        <div style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '0.05em', flexShrink: 0 }}>
          AREA<span style={{ color: '#00d4aa' }}>SCOPE</span>
        </div>
        <div className="header-nav">
          <Link href="/station-ranking" style={{ fontFamily: 'monospace', fontSize: '12px', color: '#6b7a99', background: '#111827', border: '1px solid #1e2d45', padding: '6px 12px', borderRadius: '6px', textDecoration: 'none' }}>🏆 駅ランキング</Link>
          <Link href="/station/list" style={{ fontFamily: 'monospace', fontSize: '12px', color: '#6b7a99', background: '#111827', border: '1px solid #1e2d45', padding: '6px 12px', borderRadius: '6px', textDecoration: 'none' }}>🚃 駅一覧</Link>
          <Link href="/city" style={{ fontFamily: 'monospace', fontSize: '12px', color: '#6b7a99', background: '#111827', border: '1px solid #1e2d45', padding: '6px 12px', borderRadius: '6px', textDecoration: 'none' }}>🏙️ 市区町村</Link>
          <Link href="/line" style={{ fontFamily: 'monospace', fontSize: '12px', color: '#6b7a99', background: '#111827', border: '1px solid #1e2d45', padding: '6px 12px', borderRadius: '6px', textDecoration: 'none' }}>🗺️ 路線</Link>
        </div>
      </header>

      <section className="hero">
        <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#00d4aa', letterSpacing: '3px', marginBottom: '16px' }}>
          // 駅・エリアデータ可視化
        </div>
        <h1 className="hero-title">
          日本全国の駅・<br />
          <span style={{ color: '#00d4aa' }}>エリアデータ</span>を可視化。
        </h1>
        <p style={{ fontSize: '15px', color: '#6b7a99', lineHeight: 1.8, marginBottom: '24px', maxWidth: '560px' }}>
          駅の乗降者数は、そのエリアの「人の動き」を最も正直に反映するデータです。人口が増えていても駅の利用者が伸びなければ、車移動が主体のエリアかもしれません。逆に人口が減っているのに乗降者数が維持されているなら、外部からの流入（観光・商業）が支えている可能性があります。AreaScopeは、駅と人口という2つの軸を重ねることで、数字の「意味」を読み解くお手伝いをします。
        </p>
        <div className="hero-meta">
          <div className="hero-meta-item">全国 <span>9,012</span> 駅</div>
          <div className="hero-meta-item"><span>1,256</span> 市区町村</div>
          <div className="hero-meta-item">時系列データ <span>{minYear}〜{maxYear}年</span></div>
        </div>
      </section>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 32px 40px' }}>
        <p style={{ color: '#aaa', fontSize: '14px', lineHeight: 1.8, marginBottom: '12px', maxWidth: '640px' }}>
          AreaScopeは、駅の乗降者数と市区町村の人口データをもとに、エリアの特徴や将来性を分析できるデータサイトです。
        </p>
        <p style={{ color: '#6b7a99', fontSize: '13px', lineHeight: 1.7, maxWidth: '640px' }}>
          居住エリアの比較や情報収集にご活用ください。すべてのデータは国土交通省・総務省の公式統計に基づいています。
        </p>
      </div>

      {/* データの読み方 */}
      <div style={{ borderTop: '1px solid #1e2d45', padding: '48px 32px 60px', maxWidth: '1200px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        <p style={{ fontSize: '12px', fontFamily: 'monospace', color: '#6b7a99', marginBottom: '20px', letterSpacing: '2px' }}>// データの読み方</p>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#e8edf5', marginBottom: '24px' }}>3つの視点でエリアを読む</h2>
        <div className="read-grid">
          <div style={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: '12px', padding: '24px' }}>
            <div style={{ fontSize: '24px', marginBottom: '12px' }}>📈</div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#00d4aa', marginBottom: '10px' }}>乗降者数の増減</h3>
            <p style={{ color: '#6b7a99', fontSize: '13px', lineHeight: 1.8 }}>
              ピーク時（2019年）と比較してコロナ後にどう回復したか、あるいは長期的に増加傾向にあるかを確認することで、そのエリアの「人の流れの強さ」を判断できます。
            </p>
          </div>
          <div style={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: '12px', padding: '24px' }}>
            <div style={{ fontSize: '24px', marginBottom: '12px' }}>👥</div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#00d4aa', marginBottom: '10px' }}>人口推移との比較</h3>
            <p style={{ color: '#6b7a99', fontSize: '13px', lineHeight: 1.8 }}>
              人口が増加しているエリアは賃貸需要が高まりやすく、人口が減少していても駅利用者が多いエリアは商業・観光の拠点として機能している場合があります。2つのデータを重ねることが重要です。
            </p>
          </div>
          <div style={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: '12px', padding: '24px' }}>
            <div style={{ fontSize: '24px', marginBottom: '12px' }}>🔄</div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#00d4aa', marginBottom: '10px' }}>同規模駅との比較</h3>
            <p style={{ color: '#6b7a99', fontSize: '13px', lineHeight: 1.8 }}>
              単体の数値だけでなく、同じ路線・同規模の駅と比較することでそのエリアの相対的なポジションが見えます。ランキング機能を使って周辺駅との差を確認してください。
            </p>
          </div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid #1e2d45', paddingTop: '40px' }}>
        <div className="nav-section">
          <p style={{ fontSize: '12px', fontFamily: 'monospace', color: '#6b7a99', marginBottom: '20px', letterSpacing: '2px' }}>
            // 主要ページ
          </p>
          <div className="nav-grid">
            <Link href="/station" className="nav-card">
              <div className="nav-card-icon">🔍</div>
              <div className="nav-card-title">駅検索</div>
              <div className="nav-card-desc">駅名を入力して乗降者数データを検索。全国9,012駅の時系列データを確認できます。</div>
              <div className="nav-card-link">/station →</div>
            </Link>
            <Link href="/station-ranking" className="nav-card">
              <div className="nav-card-icon">🏆</div>
              <div className="nav-card-title">駅ランキング</div>
              <div className="nav-card-desc">全国の駅乗降者数ランキング。乗降者数順で主要駅を比較できます。</div>
              <div className="nav-card-link">/station-ranking →</div>
            </Link>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', gridColumn: '1 / -1', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: '#6b7a99', alignSelf: 'center' }}>都道府県別：</span>
              {[
                { slug: 'tokyo', name: '東京都' },
                { slug: 'kanagawa', name: '神奈川県' },
                { slug: 'osaka', name: '大阪府' },
                { slug: 'aichi', name: '愛知県' },
                { slug: 'fukuoka', name: '福岡県' },
                { slug: 'saitama', name: '埼玉県' },
                { slug: 'chiba', name: '千葉県' },
                { slug: 'hyogo', name: '兵庫県' },
              ].map((p) => (
                <Link key={p.slug} href={`/station-ranking/${p.slug}`} style={{ fontSize: '11px', color: '#00d4aa', background: '#111827', border: '1px solid #1e2d45', borderRadius: '4px', padding: '3px 8px', textDecoration: 'none' }}>
                  {p.name}
                </Link>
              ))}
              <Link href="/articles/prefecture-ranking" style={{ fontSize: '11px', color: '#00d4aa', alignSelf: 'center', textDecoration: 'none', marginLeft: '4px', border: '1px solid #1e2d45', borderRadius: '4px', padding: '3px 8px', background: '#111827' }}>
                全47都道府県 →
              </Link>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <Link href="/articles/prefecture-ranking" style={{ color: '#00d4aa', fontSize: '14px', textDecoration: 'none', fontWeight: 600 }}>
                都道府県別駅ランキング一覧を見る →
              </Link>
              <span style={{ color: '#6b7a99', fontSize: '12px', marginLeft: '10px' }}>
                全国47都道府県の駅乗降者数ランキング記事を一覧で見られます。
              </span>
            </div>
            <Link href="/line" className="nav-card">
              <div className="nav-card-icon">🗺️</div>
              <div className="nav-card-title">路線一覧</div>
              <div className="nav-card-desc">路線ごとの駅データ。山手線・中央線など主要路線の沿線データを掲載しています。</div>
              <div className="nav-card-link">/line →</div>
            </Link>
            <Link href="/population" className="nav-card">
              <div className="nav-card-icon">🏙️</div>
              <div className="nav-card-title">人口分析</div>
              <div className="nav-card-desc">市区町村人口推移を分析。都道府県・市区町村を選んで人口動態を確認できます。</div>
              <div className="nav-card-link">/population →</div>
            </Link>
          </div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid #1e2d45', paddingTop: '48px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 32px 60px' }}>
          <p style={{ fontSize: '12px', fontFamily: 'monospace', color: '#6b7a99', marginBottom: '20px', letterSpacing: '2px' }}>
            // AreaScopeについて
          </p>

          <div style={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: '12px', padding: '32px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#00d4aa', marginBottom: '16px' }}>AreaScopeとは</h2>
            <p style={{ color: '#aaa', fontSize: '14px', lineHeight: 1.8, marginBottom: '16px' }}>
              AreaScopeは、国土交通省・総務省の公式データをもとに、全国9,000超の駅の乗降者数と1,200超の市区町村の人口推移を可視化するデータサービスです。駅やエリアごとの利用状況・人口動態を、誰でも無料で確認できます。
            </p>
            <p style={{ color: '#aaa', fontSize: '14px', lineHeight: 1.8 }}>
              データは{minYear}年〜{maxYear}年の時系列で収録しており、コロナ前後の変化や長期トレンドの把握に活用できます。
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px' }}>
            <div style={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: '12px', padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#e8edf5', marginBottom: '12px' }}>引っ越し・住み替え検討に</h3>
              <p style={{ color: '#6b7a99', fontSize: '13px', lineHeight: 1.7 }}>
                候補エリアの最寄り駅の乗降者数を調べ、5〜10年間の推移を確認しましょう。増加傾向にある駅周辺は街の活気が高まっており、将来的な生活利便性の向上も期待できます。人口増加データと組み合わせることで、子育て世代が増えているエリアかどうかも判断できます。
              </p>
            </div>
            <div style={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: '12px', padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#e8edf5', marginBottom: '12px' }}>エリア比較・出店検討に</h3>
              <p style={{ color: '#6b7a99', fontSize: '13px', lineHeight: 1.7 }}>
                複数の候補駅を乗降者数ランキングで比較し、客数ポテンシャルを数値で評価できます。ランキング上位でも人口が減少傾向なら将来の商圏縮小リスクがあり、逆に中規模でも人口増加エリアは成長余地があると読めます。
              </p>
            </div>
            <div style={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: '12px', padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#e8edf5', marginBottom: '12px' }}>路線・沿線分析に</h3>
              <p style={{ color: '#6b7a99', fontSize: '13px', lineHeight: 1.7 }}>
                路線単位で各駅の乗降者数を一覧で比較できます。ターミナル駅への依存度が高い路線か、複数の中核駅が分散している路線かによって、沿線の特性が大きく異なります。住み替えや出店の際は路線全体のデータを俯瞰してから候補駅を絞り込むことをおすすめします。
              </p>
            </div>
            <div style={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: '12px', padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#e8edf5', marginBottom: '12px' }}>データの出典と信頼性</h3>
              <p style={{ color: '#6b7a99', fontSize: '13px', lineHeight: 1.7 }}>
                駅乗降者数は国土交通省「国土数値情報（S12）」のオープンデータ（CC BY 4.0）を使用。人口データは総務省「e-Stat」の国勢調査に基づいています。いずれも政府が公式に公開している一次データであり、推計や独自集計は行っていません。データの詳細・注意点・ライセンスについては<Link href="/data" style={{ color: '#00d4aa' }}>データについてのページ</Link>をご覧ください。
              </p>
            </div>
          </div>

          <div style={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: '12px', padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#e8edf5', marginBottom: '12px' }}>今後の展望</h3>
            <p style={{ color: '#6b7a99', fontSize: '13px', lineHeight: 1.7 }}>
              今後は不動産価格データとの連携、駅周辺の商業施設情報の追加、AIによるエリア将来予測など、データの幅と分析機能を拡充していく予定です。
            </p>
          </div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid #1e2d45', paddingTop: '48px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 32px 60px' }}>
          <p style={{ fontSize: '12px', fontFamily: 'monospace', color: '#6b7a99', marginBottom: '20px', letterSpacing: '2px' }}>
            // クイズで楽しく学ぶ
          </p>
          <p style={{ color: '#aaa', fontSize: '14px', lineHeight: 1.8, marginBottom: '20px' }}>
            駅名・地名・路線など、データをクイズ形式で楽しく学べます。
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link href="/quiz" style={{ color: '#e8edf5', textDecoration: 'none', background: '#111827', border: '1px solid #1e2d45', borderRadius: '8px', padding: '12px 20px', fontSize: '14px' }}>
              クイズ一覧を見る
            </Link>
            <Link href="/station/hard-reading" style={{ color: '#e8edf5', textDecoration: 'none', background: '#111827', border: '1px solid #1e2d45', borderRadius: '8px', padding: '12px 20px', fontSize: '14px' }}>
              難読駅名一覧を見る
            </Link>
            <Link href="/city/hard-reading" style={{ color: '#e8edf5', textDecoration: 'none', background: '#111827', border: '1px solid #1e2d45', borderRadius: '8px', padding: '12px 20px', fontSize: '14px' }}>
              難読市区町村名一覧を見る
            </Link>
          </div>
        </div>
      </div>

      <footer style={{ padding: '20px 32px', borderTop: '1px solid #1e2d45', fontFamily: 'monospace', fontSize: '11px', color: '#6b7a99', textAlign: 'center', marginTop: 'auto' }}>
        <div style={{ marginBottom: '10px' }}>出典: 国土交通省 国土数値情報 / 総務省統計局 e-Stat | © 2026 AREASCOPE</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <Link href="/about" style={{ color: '#00d4aa', textDecoration: 'none' }}>運営者情報</Link>
          <Link href="/privacy" style={{ color: '#00d4aa', textDecoration: 'none' }}>プライバシーポリシー</Link>
          <Link href="/data" style={{ color: '#00d4aa', textDecoration: 'none' }}>データについて</Link>
          <Link href="/contact" style={{ color: '#00d4aa', textDecoration: 'none' }}>お問い合わせ</Link>
        </div>
      </footer>
    </main>
  );
}
