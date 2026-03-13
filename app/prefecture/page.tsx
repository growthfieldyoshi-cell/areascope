import Link from 'next/link';
import type { Metadata } from 'next';

const BASE_URL = 'https://areascope.jp';
const OG_IMAGE = 'https://areascope.jp/og-default.jpg';

export const metadata: Metadata = {
  title: '日本の都道府県別 駅乗降者数ランキング一覧｜AreaScope',
  description: '日本全国の都道府県ごとの駅乗降者数ランキングページ一覧です。各都道府県の主要駅ランキングや駅一覧を確認できます。',
  alternates: {
    canonical: `${BASE_URL}/prefecture`,
  },
  openGraph: {
    type: 'website',
    title: '日本の都道府県別 駅乗降者数ランキング一覧｜AreaScope',
    description: '日本全国の都道府県ごとの駅乗降者数ランキングページ一覧です。各都道府県の主要駅ランキングや駅一覧を確認できます。',
    url: `${BASE_URL}/prefecture`,
    siteName: 'AreaScope',
    images: [{ url: OG_IMAGE }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '日本の都道府県別 駅乗降者数ランキング一覧｜AreaScope',
    description: '日本全国の都道府県ごとの駅乗降者数ランキングページ一覧です。各都道府県の主要駅ランキングや駅一覧を確認できます。',
    images: [OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const PREFS: { name: string; slug: string }[] = [
  { name: '北海道', slug: 'hokkaido' },
  { name: '青森県', slug: 'aomori' },
  { name: '岩手県', slug: 'iwate' },
  { name: '宮城県', slug: 'miyagi' },
  { name: '秋田県', slug: 'akita' },
  { name: '山形県', slug: 'yamagata' },
  { name: '福島県', slug: 'fukushima' },
  { name: '茨城県', slug: 'ibaraki' },
  { name: '栃木県', slug: 'tochigi' },
  { name: '群馬県', slug: 'gunma' },
  { name: '埼玉県', slug: 'saitama' },
  { name: '千葉県', slug: 'chiba' },
  { name: '東京都', slug: 'tokyo' },
  { name: '神奈川県', slug: 'kanagawa' },
  { name: '新潟県', slug: 'niigata' },
  { name: '富山県', slug: 'toyama' },
  { name: '石川県', slug: 'ishikawa' },
  { name: '福井県', slug: 'fukui' },
  { name: '山梨県', slug: 'yamanashi' },
  { name: '長野県', slug: 'nagano' },
  { name: '岐阜県', slug: 'gifu' },
  { name: '静岡県', slug: 'shizuoka' },
  { name: '愛知県', slug: 'aichi' },
  { name: '三重県', slug: 'mie' },
  { name: '滋賀県', slug: 'shiga' },
  { name: '京都府', slug: 'kyoto' },
  { name: '大阪府', slug: 'osaka' },
  { name: '兵庫県', slug: 'hyogo' },
  { name: '奈良県', slug: 'nara' },
  { name: '和歌山県', slug: 'wakayama' },
  { name: '鳥取県', slug: 'tottori' },
  { name: '島根県', slug: 'shimane' },
  { name: '岡山県', slug: 'okayama' },
  { name: '広島県', slug: 'hiroshima' },
  { name: '山口県', slug: 'yamaguchi' },
  { name: '徳島県', slug: 'tokushima' },
  { name: '香川県', slug: 'kagawa' },
  { name: '愛媛県', slug: 'ehime' },
  { name: '高知県', slug: 'kochi' },
  { name: '福岡県', slug: 'fukuoka' },
  { name: '佐賀県', slug: 'saga' },
  { name: '長崎県', slug: 'nagasaki' },
  { name: '熊本県', slug: 'kumamoto' },
  { name: '大分県', slug: 'oita' },
  { name: '宮崎県', slug: 'miyazaki' },
  { name: '鹿児島県', slug: 'kagoshima' },
  { name: '沖縄県', slug: 'okinawa' },
];

export default function PrefectureListPage() {
  return (
    <main style={{ background: '#0a0e1a', minHeight: '100vh', color: '#e8edf5', padding: '2rem', fontFamily: 'sans-serif', maxWidth: '960px', margin: '0 auto' }}>

      <h1 style={{ fontSize: '1.8rem', color: '#00d4aa', marginBottom: '0.75rem' }}>
        日本の都道府県別 駅乗降者数データ
      </h1>
      <p style={{ color: '#aaa', marginBottom: '2rem', lineHeight: '1.9', fontSize: '0.95rem' }}>
        日本全国の都道府県ごとの駅乗降者数ランキングと駅一覧を掲載しています。
        各都道府県ページでは主要駅のランキングや全駅一覧、駅の利用者数推移データを確認できます。
      </p>

      <section>
        <h2 style={{ fontSize: '1.3rem', color: '#00d4aa', marginBottom: '1rem' }}>
          都道府県一覧
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem' }}>
          {PREFS.map(pref => (
            <Link
              key={pref.slug}
              href={`/prefecture/${pref.slug}`}
              style={{
                background: '#111827',
                border: '1px solid #1e2d45',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                color: '#e8edf5',
                textDecoration: 'none',
                fontSize: '0.95rem',
                display: 'block',
                transition: 'border-color 0.2s',
              }}
            >
              {pref.name}
            </Link>
          ))}
        </div>
      </section>

      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ fontSize: '1.3rem', color: '#00d4aa', marginBottom: '0.5rem' }}>
          ほかの駅データを見る
        </h2>
        <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '1rem' }}>
          全国の駅ランキングや駅一覧もあわせてご覧ください。
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/station-ranking" style={{ color: '#00d4aa', textDecoration: 'none', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', fontSize: '0.9rem' }}>
            🏆 全国駅乗降者数ランキング
          </Link>
          <Link href="/station/list" style={{ color: '#00d4aa', textDecoration: 'none', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', fontSize: '0.9rem' }}>
            📋 全国駅一覧
          </Link>
        </div>
      </section>

    </main>
  );
}