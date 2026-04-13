import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '都道府県別 人口増加ランキング【最新】｜AreaScope',
  description: '都道府県別に人口が増えている市区町村をランキング形式で確認できます。県別の人口動向を把握するのに活用してください。',
  alternates: {
    canonical: 'https://areascope.jp/population-ranking',
  },
  openGraph: {
    type: 'website',
    title: '都道府県別 人口増加ランキング【最新】｜AreaScope',
    description: '都道府県別に人口が増えている市区町村をランキング形式で確認できます。県別の人口動向を把握するのに活用してください。',
    url: 'https://areascope.jp/population-ranking',
    siteName: 'AreaScope',
  },
};

const PREFECTURES = [
  { slug: 'hokkaido', name: '北海道' },
  { slug: 'aomori', name: '青森県' },
  { slug: 'iwate', name: '岩手県' },
  { slug: 'miyagi', name: '宮城県' },
  { slug: 'akita', name: '秋田県' },
  { slug: 'yamagata', name: '山形県' },
  { slug: 'fukushima', name: '福島県' },
  { slug: 'ibaraki', name: '茨城県' },
  { slug: 'tochigi', name: '栃木県' },
  { slug: 'gunma', name: '群馬県' },
  { slug: 'saitama', name: '埼玉県' },
  { slug: 'chiba', name: '千葉県' },
  { slug: 'tokyo', name: '東京都' },
  { slug: 'kanagawa', name: '神奈川県' },
  { slug: 'niigata', name: '新潟県' },
  { slug: 'toyama', name: '富山県' },
  { slug: 'ishikawa', name: '石川県' },
  { slug: 'fukui', name: '福井県' },
  { slug: 'yamanashi', name: '山梨県' },
  { slug: 'nagano', name: '長野県' },
  { slug: 'gifu', name: '岐阜県' },
  { slug: 'shizuoka', name: '静岡県' },
  { slug: 'aichi', name: '愛知県' },
  { slug: 'mie', name: '三重県' },
  { slug: 'shiga', name: '滋賀県' },
  { slug: 'kyoto', name: '京都府' },
  { slug: 'osaka', name: '大阪府' },
  { slug: 'hyogo', name: '兵庫県' },
  { slug: 'nara', name: '奈良県' },
  { slug: 'wakayama', name: '和歌山県' },
  { slug: 'tottori', name: '鳥取県' },
  { slug: 'shimane', name: '島根県' },
  { slug: 'okayama', name: '岡山県' },
  { slug: 'hiroshima', name: '広島県' },
  { slug: 'yamaguchi', name: '山口県' },
  { slug: 'tokushima', name: '徳島県' },
  { slug: 'kagawa', name: '香川県' },
  { slug: 'ehime', name: '愛媛県' },
  { slug: 'kochi', name: '高知県' },
  { slug: 'fukuoka', name: '福岡県' },
  { slug: 'saga', name: '佐賀県' },
  { slug: 'nagasaki', name: '長崎県' },
  { slug: 'kumamoto', name: '熊本県' },
  { slug: 'oita', name: '大分県' },
  { slug: 'miyazaki', name: '宮崎県' },
  { slug: 'kagoshima', name: '鹿児島県' },
  { slug: 'okinawa', name: '沖縄県' },
];

export default function PopulationRankingIndexPage() {
  return (
    <main style={{ background: '#0a0e1a', minHeight: '100vh', color: '#e8edf5', fontFamily: 'sans-serif' }}>
      <style>{`
        .pref-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
        .pref-card { background: #111827; border: 1px solid #1e2d45; border-radius: 8px; padding: 16px; text-decoration: none; color: #e8edf5; font-size: 15px; font-weight: 600; text-align: center; }
        .pref-card:hover { border-color: #00d4aa; }
        @media (max-width: 768px) { .pref-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 480px) { .pref-grid { grid-template-columns: repeat(2, 1fr); } }
      `}</style>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 20px' }}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'トップ', item: 'https://areascope.jp' },
                { '@type': 'ListItem', position: 2, name: '都道府県別 人口増加ランキング' },
              ],
            }),
          }}
        />

        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '12px' }}>
          都道府県別 <span style={{ color: '#00d4aa' }}>人口増加</span>ランキング
        </h1>
        <p style={{ color: '#aaa', fontSize: '14px', lineHeight: 1.8, marginBottom: '32px' }}>
          都道府県を選んで、県内で人口が増えている市区町村のランキングを確認できます。
        </p>

        <div className="pref-grid">
          {PREFECTURES.map((p) => (
            <Link key={p.slug} href={`/population-ranking/${p.slug}`} className="pref-card">
              {p.name}
            </Link>
          ))}
        </div>

        <div style={{ marginTop: '48px', borderTop: '1px solid #1e2d45', paddingTop: '24px' }}>
          <p style={{ color: '#6b7a99', fontSize: '12px', marginBottom: '12px', fontFamily: 'monospace', letterSpacing: '2px' }}>// 関連ページ</p>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <Link href="/population" style={{ color: '#00d4aa', textDecoration: 'none', fontSize: '13px' }}>人口分析ツール</Link>
            <Link href="/articles/population-analysis" style={{ color: '#00d4aa', textDecoration: 'none', fontSize: '13px' }}>人口分析の記事一覧</Link>
            <Link href="/station-ranking" style={{ color: '#00d4aa', textDecoration: 'none', fontSize: '13px' }}>全国駅ランキング</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
