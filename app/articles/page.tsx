import Link from 'next/link';

const ARTICLES = [
  {
    slug: 'how-to-find-population-growth-area',
    title: '人口が増えている街の見つけ方｜エリア選びの基本とデータの見方',
    description: '人口増加エリアの見つけ方を解説。川崎・流山・守谷など実例を交えながら、人口推移データと乗降者数を組み合わせたエリア分析の基本を紹介します。',
  },
  {
    slug: 'station-passengers-area-analysis',
    title: '駅の乗降者数から見る街の特徴｜エリア分析の基本と見方',
    description: '駅の乗降者数データを使ったエリア分析の基本を解説。新宿・金沢・高山の具体例を交えながら、乗降者数の読み方と人口データとの組み合わせ方を紹介します。',
  },
  {
    slug: 'population-growth-area-ranking',
    title: '人口増加エリアランキングの見方',
    description: '人口増加ランキングは、増加率だけで見ると判断を誤りやすいです。絶対数、継続性、駅利用の変化まで含めて読み解くための基本を整理します。',
  },
  {
    slug: 'station-ranking-livability',
    title: '駅ランキングから見る住みやすい街',
    description: '乗降者数が多い駅ほど住みやすい、とは限りません。ターミナル型・住宅型・バランス型に分けて、住みやすさの見方を整理します。',
  },
  {
    slug: 'rural-city-livability',
    title: '地方都市は住みやすいのか？',
    description: '地方都市は一括りにできません。コンパクトシティ型、車依存型、衰退型の違いを踏まえ、人口と駅データから住みやすさを考えます。',
  },
  {
    slug: 'how-to-find-bedroom-community',
    title: 'ベッドタウンの見つけ方',
    description: 'ベッドタウンは、都心に近いだけでは判断できません。通勤先との関係、駅利用、商業集積、人口の安定性から見つける考え方を整理します。',
  },
  {
    slug: 'how-to-choose-commute-area',
    title: '通勤しやすい街の選び方',
    description: '通勤しやすさは距離だけでは決まりません。乗り換え回数、路線の強さ、代替ルート、混雑傾向から通勤しやすい街の選び方を解説します。',
  },
];

export default function ArticlesIndexPage() {
  return (
    <main style={{ background: '#0a0e1a', minHeight: '100vh', color: '#e8edf5', fontFamily: 'sans-serif' }}>
      <style>{`
        .articles-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        .article-card:hover { border-color: #00d4aa !important; }
        @media (max-width: 640px) { .articles-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 20px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '12px' }}>
          AreaScope <span style={{ color: '#00d4aa' }}>記事</span>一覧
        </h1>
        <p style={{ color: '#aaa', fontSize: '14px', lineHeight: 1.8, marginBottom: '32px' }}>
          駅の乗降者数や市区町村の人口推移を活用したエリア分析に関する記事をまとめています。
        </p>

        <div className="articles-grid">
          {ARTICLES.map((article) => (
            <Link
              key={article.slug}
              href={`/articles/${article.slug}`}
              className="article-card"
              style={{
                background: '#111827',
                border: '1px solid #1e2d45',
                borderRadius: '12px',
                padding: '28px',
                textDecoration: 'none',
                color: '#e8edf5',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <div style={{ fontSize: '16px', fontWeight: 700, lineHeight: 1.5 }}>{article.title}</div>
              <div style={{ color: '#aaa', fontSize: '13px', lineHeight: 1.7 }}>{article.description}</div>
              <div style={{ color: '#00d4aa', fontSize: '13px', marginTop: 'auto', paddingTop: '8px' }}>
                記事を読む &rarr;
              </div>
            </Link>
          ))}
        </div>

        <div style={{ marginTop: '48px', borderTop: '1px solid #1e2d45', paddingTop: '24px' }}>
          <p style={{ color: '#6b7a99', fontSize: '12px', marginBottom: '12px', fontFamily: 'monospace', letterSpacing: '2px' }}>// 関連ページ</p>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <Link href="/station-ranking" style={{ color: '#00d4aa', textDecoration: 'none', fontSize: '13px' }}>駅乗降者数ランキングを見る</Link>
            <Link href="/city" style={{ color: '#00d4aa', textDecoration: 'none', fontSize: '13px' }}>市区町村一覧を見る</Link>
            <Link href="/quiz" style={{ color: '#00d4aa', textDecoration: 'none', fontSize: '13px' }}>クイズ一覧を見る</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
